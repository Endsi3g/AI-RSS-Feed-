-- AI RSS Feed — Supabase Schema
-- Run this in your Supabase SQL editor

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username    TEXT,
  email       TEXT,
  theme       TEXT DEFAULT 'auto' CHECK (theme IN ('auto', 'light', 'dark')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RSS Sources
CREATE TABLE IF NOT EXISTS public.sources (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name            TEXT NOT NULL,
  url             TEXT NOT NULL,
  feed_url        TEXT NOT NULL UNIQUE,
  description     TEXT,
  category        TEXT NOT NULL DEFAULT 'research' CHECK (category IN ('models', 'research', 'startups', 'products', 'regulation')),
  icon_url        TEXT,
  is_default      BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  last_fetched_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sources are publicly readable" ON public.sources FOR SELECT USING (TRUE);

-- Articles
CREATE TABLE IF NOT EXISTS public.articles (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id    UUID REFERENCES public.sources(id) ON DELETE CASCADE NOT NULL,
  title        TEXT NOT NULL,
  url          TEXT NOT NULL UNIQUE,
  description  TEXT,
  content      TEXT,
  author       TEXT,
  published_at TIMESTAMPTZ,
  image_url    TEXT,
  tags         TEXT[] DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS articles_source_id_idx ON public.articles(source_id);
CREATE INDEX IF NOT EXISTS articles_published_at_idx ON public.articles(published_at DESC);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Articles are publicly readable" ON public.articles FOR SELECT USING (TRUE);
CREATE POLICY "Service role can insert articles" ON public.articles FOR INSERT WITH CHECK (TRUE);

-- User Source Subscriptions
CREATE TABLE IF NOT EXISTS public.user_sources (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source_id  UUID REFERENCES public.sources(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, source_id)
);

ALTER TABLE public.user_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own source subs" ON public.user_sources USING (auth.uid() = user_id);

-- Bookmarks
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  type       TEXT DEFAULT 'favorite' CHECK (type IN ('favorite', 'read_later')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id, type)
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookmarks" ON public.bookmarks USING (auth.uid() = user_id);

-- Read Status
CREATE TABLE IF NOT EXISTS public.read_status (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  read_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

ALTER TABLE public.read_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own read status" ON public.read_status USING (auth.uid() = user_id);

-- Push Subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint   TEXT NOT NULL,
  keys       JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own push subs" ON public.push_subscriptions USING (auth.uid() = user_id);

-- Notification Rules
CREATE TABLE IF NOT EXISTS public.notification_rules (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('keyword', 'source', 'daily_digest')),
  value      TEXT,
  enabled    BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notification_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notification rules" ON public.notification_rules USING (auth.uid() = user_id);

-- Seed default sources
INSERT INTO public.sources (name, url, feed_url, description, category, is_default) VALUES
  ('OpenAI Blog',         'https://openai.com/blog',                                           'https://openai.com/blog/rss.xml',                                        'Actualités officielles d''OpenAI',           'models',     TRUE),
  ('Anthropic News',      'https://www.anthropic.com/news',                                    'https://www.anthropic.com/rss.xml',                                      'Blog officiel d''Anthropic',                  'models',     TRUE),
  ('Google DeepMind',     'https://deepmind.google/discover/blog/',                            'https://deepmind.google/blog/rss.xml',                                   'Recherche de pointe en IA de DeepMind',      'research',   TRUE),
  ('Google AI Blog',      'https://blog.google/technology/ai/',                                'https://blog.google/technology/ai/rss/',                                 'Blog IA officiel de Google',                  'models',     TRUE),
  ('Hugging Face Blog',   'https://huggingface.co/blog',                                       'https://huggingface.co/blog/feed.xml',                                   'ML open-source et modèles',                  'research',   TRUE),
  ('MIT Tech Review AI',  'https://www.technologyreview.com/topic/artificial-intelligence/',   'https://www.technologyreview.com/feed/',                                 'IA par MIT Technology Review',               'research',   TRUE),
  ('arXiv cs.AI',         'https://arxiv.org/list/cs.AI/recent',                              'https://rss.arxiv.org/rss/cs.AI',                                        'Derniers papiers IA sur arXiv',              'research',   TRUE),
  ('MarkTechPost',        'https://www.marktechpost.com',                                      'https://www.marktechpost.com/feed/',                                     'Actualités IA et ML',                        'research',   TRUE),
  ('The Batch',           'https://www.deeplearning.ai/the-batch/',                            'https://www.deeplearning.ai/the-batch/rss.xml',                          'Newsletter IA de deeplearning.ai',           'research',   TRUE),
  ('VentureBeat AI',      'https://venturebeat.com/ai/',                                       'https://venturebeat.com/ai/feed/',                                       'IA et tech startups',                        'startups',   TRUE),
  ('TechCrunch AI',       'https://techcrunch.com/category/artificial-intelligence/',          'https://techcrunch.com/category/artificial-intelligence/feed/',          'Startups et produits IA',                    'startups',   TRUE),
  ('The Verge AI',        'https://www.theverge.com/ai-artificial-intelligence',              'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',      'Produits et tendances IA grand public',      'products',   TRUE),
  ('Wired AI',            'https://www.wired.com/tag/artificial-intelligence/',               'https://www.wired.com/feed/tag/ai/latest/rss',                           'IA vu par Wired',                            'products',   TRUE),
  ('Import AI',           'https://jack-clark.net',                                            'https://jack-clark.net/feed/',                                           'Newsletter hebdo de Jack Clark (Anthropic)',  'research',   FALSE),
  ('Papers With Code',    'https://paperswithcode.com',                                        'https://paperswithcode.com/latest.rss',                                  'Papiers ML avec code open-source',           'research',   FALSE),
  ('Microsoft AI Blog',   'https://blogs.microsoft.com/ai/',                                   'https://blogs.microsoft.com/ai/feed/',                                   'Blog IA de Microsoft',                       'models',     FALSE),
  ('Meta AI Blog',        'https://ai.meta.com/blog/',                                         'https://ai.meta.com/blog/rss/',                                          'Recherche IA de Meta',                       'models',     FALSE),
  ('AWS ML Blog',         'https://aws.amazon.com/blogs/machine-learning/',                    'https://aws.amazon.com/blogs/machine-learning/feed/',                    'Machine learning sur AWS',                   'products',   FALSE),
  ('AI Alignment Forum',  'https://www.alignmentforum.org',                                    'https://www.alignmentforum.org/feed.xml',                                'Sécurité et alignement IA',                  'regulation', FALSE),
  ('Towards Data Science','https://towardsdatascience.com',                                    'https://medium.com/feed/towards-data-science',                           'Tutoriels et articles data science',         'research',   FALSE)
ON CONFLICT (feed_url) DO NOTHING;
