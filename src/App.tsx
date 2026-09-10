/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MagazineProvider, useMagazine } from './context/MagazineContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { SavedStoriesDrawer } from './components/SavedStoriesDrawer';
import { NewsletterModal } from './components/NewsletterModal';
import { ShareModal } from './components/ShareModal';
import { AudioPlayerBar } from './components/AudioPlayerBar';

import { HomePage } from './pages/HomePage';
import { ArticlePage } from './pages/ArticlePage';
import { CategoryPage } from './pages/CategoryPage';
import { TodayPage } from './pages/TodayPage';
import { ExplorePage } from './pages/ExplorePage';
import { IssuesPage } from './pages/IssuesPage';
import { SeriesPage } from './pages/SeriesPage';
import { AboutPage } from './pages/AboutPage';
import { NewsletterPage } from './pages/NewsletterPage';
import { SavedPage } from './pages/SavedPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SubscriptionVerifyPage } from './pages/SubscriptionVerifyPage';
import { SubscriptionUnsubscribePage } from './pages/SubscriptionUnsubscribePage';
import { EditorialErrorBoundary } from './components/EditorialErrorBoundary';

// Admin CMS Components
import { AdminLayout, AdminTab } from './components/admin/AdminLayout';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminAccessDenied } from './components/admin/AdminAccessDenied';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminArticlesList } from './components/admin/AdminArticlesList';
import { AdminArticleEditor } from './components/admin/AdminArticleEditor';
import { AdminMediaLibrary } from './components/admin/AdminMediaLibrary';
import { AdminHomepageManager } from './components/admin/AdminHomepageManager';
import { AdminCategoriesTags } from './components/admin/AdminCategoriesTags';
import { AdminAuthors } from './components/admin/AdminAuthors';
import { AdminSeriesIssues } from './components/admin/AdminSeriesIssues';
import { AdminSubscribers } from './components/admin/AdminSubscribers';
import { AdminAnalytics } from './components/admin/AdminAnalytics';
import { AdminSocialMedia } from './components/admin/AdminSocialMedia';
import { AdminUsersRoles } from './components/admin/AdminUsersRoles';
import { AdminTrash } from './components/admin/AdminTrash';
import { AdminAuditLogs } from './components/admin/AdminAuditLogs';
import { AdminNavigationManager } from './components/admin/AdminNavigationManager';
import { AdminApiKeys } from './components/admin/AdminApiKeys';

type ViewType =
  | { type: 'home' }
  | { type: 'article'; slug: string }
  | { type: 'category'; categorySlug: string }
  | { type: 'today' }
  | { type: 'explore' }
  | { type: 'issues'; issueId?: string }
  | { type: 'series'; seriesId?: string }
  | { type: 'about' }
  | { type: 'newsletter' }
  | { type: 'verify' }
  | { type: 'unsubscribe' }
  | { type: 'saved' }
  | { type: 'admin'; tab: AdminTab; editingArticleId?: string | null }
  | { type: 'notfound' };

function MainMagazineApp() {
  const { isAuthenticated, currentUser, isOwner } = useMagazine();
  const [currentView, setCurrentView] = useState<ViewType>({ type: 'home' });

  // Sync with browser route (both hash and pathname) on load or navigation
  useEffect(() => {
    const handleRoute = () => {
      let route = '';
      if (window.location.hash) {
        const rawHash = window.location.hash.replace(/^#/, '');
        const hashWithoutQuery = rawHash.split('?')[0];
        route = hashWithoutQuery.startsWith('/') ? hashWithoutQuery.slice(1) : hashWithoutQuery;
      } else if (window.location.pathname && window.location.pathname !== '/') {
        const rawPath = window.location.pathname;
        route = rawPath.startsWith('/') ? rawPath.slice(1) : rawPath;
      }

      const cleanHash = route;

      if (!cleanHash || cleanHash === 'home') {
        setCurrentView({ type: 'home' });
      } else if (cleanHash.startsWith('story/')) {
        const slug = cleanHash.replace('story/', '');
        setCurrentView({ type: 'article', slug });
      } else if (cleanHash.startsWith('category/')) {
        const cat = cleanHash.replace('category/', '');
        setCurrentView({ type: 'category', categorySlug: cat });
      } else if (cleanHash === 'today') {
        setCurrentView({ type: 'today' });
      } else if (cleanHash === 'explore') {
        setCurrentView({ type: 'explore' });
      } else if (cleanHash.startsWith('issues')) {
        const parts = cleanHash.split('/');
        setCurrentView({ type: 'issues', issueId: parts[1] });
      } else if (cleanHash.startsWith('series')) {
        const parts = cleanHash.split('/');
        setCurrentView({ type: 'series', seriesId: parts[1] });
      } else if (cleanHash === 'about') {
        setCurrentView({ type: 'about' });
      } else if (cleanHash === 'newsletter') {
        setCurrentView({ type: 'newsletter' });
      } else if (cleanHash.startsWith('verify')) {
        setCurrentView({ type: 'verify' });
      } else if (cleanHash.startsWith('unsubscribe')) {
        setCurrentView({ type: 'unsubscribe' });
      } else if (cleanHash === 'saved') {
        setCurrentView({ type: 'saved' });
      } else if (
        cleanHash === 'admin' ||
        cleanHash.startsWith('admin/') ||
        cleanHash === 'owner' ||
        cleanHash.startsWith('owner/')
      ) {
        const parts = cleanHash.split('/');
        const tab = (parts[1] as AdminTab) || 'overview';
        const editingId = parts[2] || null;
        setCurrentView({ type: 'admin', tab, editingArticleId: editingId });
      } else if (cleanHash) {
        // Direct article title or slug format: (applink/#/article title)
        const resolvedSlug = decodeURIComponent(cleanHash);
        setCurrentView({ type: 'article', slug: resolvedSlug });
      }
    };

    handleRoute();
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);
    return () => {
      window.removeEventListener('hashchange', handleRoute);
      window.removeEventListener('popstate', handleRoute);
    };
  }, []);

  // Navigation handlers with window.scrollTo and optional hash update
  const navigateToStory = (slug: string) => {
    window.location.hash = `/story/${slug}`;
    setCurrentView({ type: 'article', slug });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCategory = (categorySlug: string) => {
    window.location.hash = `/category/${categorySlug}`;
    setCurrentView({ type: 'category', categorySlug });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToToday = () => {
    window.location.hash = '/today';
    setCurrentView({ type: 'today' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToExplore = () => {
    window.location.hash = '/explore';
    setCurrentView({ type: 'explore' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToIssues = (issueId?: string) => {
    window.location.hash = issueId ? `/issues/${issueId}` : '/issues';
    setCurrentView({ type: 'issues', issueId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToSeries = (seriesId?: string) => {
    window.location.hash = seriesId ? `/series/${seriesId}` : '/series';
    setCurrentView({ type: 'series', seriesId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAbout = () => {
    window.location.hash = '/about';
    setCurrentView({ type: 'about' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToNewsletter = () => {
    window.location.hash = '/newsletter';
    setCurrentView({ type: 'newsletter' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToSaved = () => {
    window.location.hash = '/saved';
    setCurrentView({ type: 'saved' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    window.location.hash = '/';
    setCurrentView({ type: 'home' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAdmin = (tab: AdminTab = 'overview', editingId?: string | null) => {
    const hash = editingId ? `/admin/${tab}/${editingId}` : `/admin/${tab}`;
    window.location.hash = hash;
    setCurrentView({ type: 'admin', tab, editingArticleId: editingId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in Admin view, render Admin Portal
  if (currentView.type === 'admin') {
    if (!isAuthenticated) {
      return <AdminLogin onBackToSite={navigateToHome} />;
    }

    if (!isOwner) {
      return <AdminAccessDenied onBackToSite={navigateToHome} />;
    }

    return (
      <AdminLayout
        currentTab={currentView.tab}
        onSelectTab={(tab) => navigateToAdmin(tab)}
        onNavigateHome={navigateToHome}
        onEditArticle={(id) => navigateToAdmin('editor', id)}
      >
        {currentView.tab === 'overview' && (
          <AdminDashboard
            onNavigateTab={(tab) => navigateToAdmin(tab)}
            onEditArticle={(id) => navigateToAdmin('editor', id)}
            onCreateArticle={() => navigateToAdmin('editor', null)}
          />
        )}

        {currentView.tab === 'articles' && (
          <AdminArticlesList
            onCreateArticle={() => navigateToAdmin('editor', null)}
            onEditArticle={(id) => navigateToAdmin('editor', id)}
            onPreviewArticle={(slug) => navigateToStory(slug)}
          />
        )}

        {currentView.tab === 'editor' && (
          <AdminArticleEditor
            articleId={currentView.editingArticleId}
            onBack={() => navigateToAdmin('articles')}
            onPreview={(slug) => navigateToStory(slug)}
          />
        )}

        {currentView.tab === 'users' && <AdminUsersRoles />}

        {currentView.tab === 'social' && <AdminSocialMedia />}

        {currentView.tab === 'navigation' && <AdminNavigationManager />}

        {currentView.tab === 'trash' && <AdminTrash />}

        {currentView.tab === 'logs' && <AdminAuditLogs />}

        {currentView.tab === 'media' && <AdminMediaLibrary />}

        {currentView.tab === 'homepage' && <AdminHomepageManager />}

        {currentView.tab === 'categories' && <AdminCategoriesTags />}

        {currentView.tab === 'authors' && <AdminAuthors />}

        {currentView.tab === 'series-issues' && <AdminSeriesIssues />}

        {currentView.tab === 'subscribers' && <AdminSubscribers />}

        {currentView.tab === 'analytics' && <AdminAnalytics />}

        {currentView.tab === 'api-keys' && <AdminApiKeys />}
      </AdminLayout>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111110] flex flex-col font-sans-editorial antialiased selection:bg-[#EA580C] selection:text-[#FFFFFF]">
      {/* Editorial Navigation Bar */}
      <Navbar
        onNavigateHome={navigateToHome}
        onNavigateCategory={navigateToCategory}
        onNavigateToday={navigateToToday}
        onNavigateExplore={navigateToExplore}
        onNavigateIssues={() => navigateToIssues()}
        onNavigateSeries={() => navigateToSeries()}
        onNavigateAbout={navigateToAbout}
        onNavigateSaved={navigateToSaved}
        onNavigateAdmin={(tab) => navigateToAdmin(tab)}
        onNavigateNewsletter={navigateToNewsletter}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentView.type === 'home' && (
          <HomePage
            onSelectStory={navigateToStory}
            onNavigateCategory={navigateToCategory}
            onNavigateIssues={() => navigateToIssues()}
            onSelectIssue={(issueId) => navigateToIssues(issueId)}
            onSelectSeries={(seriesId) => navigateToSeries(seriesId)}
          />
        )}

        {currentView.type === 'article' && (
          <ArticlePage
            slug={currentView.slug}
            onNavigateStory={navigateToStory}
            onNavigateCategory={navigateToCategory}
            onBack={navigateToHome}
          />
        )}

        {currentView.type === 'category' && (
          <CategoryPage
            categorySlug={currentView.categorySlug}
            onSelectStory={navigateToStory}
            onNavigateCategory={navigateToCategory}
            onBack={navigateToHome}
          />
        )}

        {currentView.type === 'today' && (
          <TodayPage
            onSelectStory={navigateToStory}
            onBack={navigateToHome}
          />
        )}

        {currentView.type === 'explore' && (
          <ExplorePage
            onSelectStory={navigateToStory}
            onNavigateCategory={navigateToCategory}
            onBack={navigateToHome}
          />
        )}

        {currentView.type === 'issues' && (
          <IssuesPage
            initialIssueId={currentView.issueId}
            onSelectStory={navigateToStory}
            onBack={navigateToHome}
          />
        )}

        {currentView.type === 'series' && (
          <SeriesPage
            initialSeriesId={currentView.seriesId}
            onSelectStory={navigateToStory}
            onBack={navigateToHome}
          />
        )}

        {currentView.type === 'about' && (
          <AboutPage
            onBack={navigateToHome}
            onNavigateNewsletter={navigateToNewsletter}
          />
        )}

        {currentView.type === 'newsletter' && (
          <NewsletterPage onBack={navigateToHome} />
        )}

        {currentView.type === 'verify' && (
          <SubscriptionVerifyPage onHome={navigateToHome} onExplore={navigateToExplore} />
        )}

        {currentView.type === 'unsubscribe' && (
          <SubscriptionUnsubscribePage onHome={navigateToHome} />
        )}

        {currentView.type === 'saved' && (
          <SavedPage
            onSelectStory={navigateToStory}
            onBack={navigateToHome}
          />
        )}

        {currentView.type === 'notfound' && (
          <NotFoundPage onHome={navigateToHome} onExplore={navigateToExplore} />
        )}
      </main>

      {/* Editorial Footer */}
      <Footer
        onNavigateHome={navigateToHome}
        onNavigateCategory={navigateToCategory}
        onNavigateToday={navigateToToday}
        onNavigateExplore={navigateToExplore}
        onNavigateIssues={() => navigateToIssues()}
        onNavigateSeries={() => navigateToSeries()}
        onNavigateAbout={navigateToAbout}
        onNavigateNewsletter={navigateToNewsletter}
      />

      {/* Global Modals & Persistent Components */}
      <SearchModal
        onSelectStory={navigateToStory}
        onSelectCategory={navigateToCategory}
      />
      <SavedStoriesDrawer onSelectStory={navigateToStory} />
      <NewsletterModal />
      <ShareModal />
      <AudioPlayerBar />
    </div>
  );
}

export default function App() {
  return (
    <EditorialErrorBoundary>
      <MagazineProvider>
        <MainMagazineApp />
      </MagazineProvider>
    </EditorialErrorBoundary>
  );
}
