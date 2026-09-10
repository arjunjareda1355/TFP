/**
 * The Folded Page - Centralized Editorial Copy System for Errors, Notices & Fallbacks
 * 
 * Provides human, calm, brand-consistent, and reassuring copy for all system states.
 * Guarantees that users are always informed:
 * 1. What happened?
 * 2. Is my work safe?
 * 3. What can I do now?
 */

export interface ErrorCopyEntry {
  title: string;
  description: string;
  primaryAction: string;
  secondaryAction?: string;
  reassurance?: string;
}

export const EDITORIAL_ERROR_COPY = {
  PAGE: {
    NOT_FOUND: {
      title: 'Seems the page is folded.',
      description: "We couldn't find the page or story you're looking for. It may have been relocated, renamed, or gathered into another folio.",
      primaryAction: 'Return to Front Page',
      secondaryAction: 'Explore Dispatches',
      reassurance: 'All other published stories and collections remain available.',
    },
    SERVER_ERROR: {
      title: 'Looks like we hit a crease.',
      description: 'Something encountered an unexpected crease while unfolding this page. Our editorial team has been notified.',
      primaryAction: 'Try Again',
      secondaryAction: 'Return Home',
      reassurance: 'Your session and saved stories are preserved.',
    },
    NETWORK_ERROR: {
      title: "Looks like you're between pages.",
      description: 'The page is waiting for a stable connection. Reconnect to keep reading.',
      primaryAction: 'Try Again',
      secondaryAction: 'Go Home',
      reassurance: 'Your local notes and drafts remain safe on this device.',
    },
    OFFLINE: {
      title: "You're currently offline.",
      description: 'Your device is between pages. Reconnect to load live updates and publish new stories.',
      primaryAction: 'Retry Connection',
      reassurance: 'All locally cached articles and in-progress edits are preserved.',
    },
  },

  IMAGE: {
    UNAVAILABLE: {
      title: 'Seems this image got folded away.',
      description: "We couldn't unfold this image right now.",
      primaryAction: 'Retry Image',
      reassurance: 'The story and text content remain intact.',
    },
    UPLOAD_FAILED: {
      title: "Looks like this image didn't make it through the fold.",
      description: 'The upload encountered a disruption. Please verify the image format and try again.',
      primaryAction: 'Try Again',
      secondaryAction: 'Choose Another Image',
      reassurance: 'Your draft text and previous images are safe.',
    },
  },

  ARTICLE: {
    LOAD_FAILED: {
      title: 'Seems this story got folded away.',
      description: "We couldn't load the requested article at this moment.",
      primaryAction: 'Try Again',
      secondaryAction: 'Explore Stories',
      reassurance: 'The article is securely stored in our archive.',
    },
    SAVE_FAILED: {
      title: "Couldn't save your changes to the cloud.",
      description: 'The server could not be reached to commit this revision.',
      primaryAction: 'Try Again',
      secondaryAction: 'Save Snapshot Locally',
      reassurance: 'Your article is still safe in your browser storage. Do not close this tab.',
    },
    PUBLISH_FAILED: {
      title: "Your story didn't make it to the live page yet.",
      description: 'A transient interruption prevented public distribution.',
      primaryAction: 'Retry Publishing',
      secondaryAction: 'View as Draft',
      reassurance: 'Your article is safely saved as a draft with all revisions intact.',
    },
    UNSAVED_CHANGES: {
      title: "Your page isn't fully folded yet.",
      description: 'You have unsaved editorial changes that have not yet been committed.',
      primaryAction: 'Keep Editing',
      secondaryAction: 'Leave Without Saving',
      reassurance: 'A local recovery snapshot has been cached on this machine.',
    },
    DRAFT_RECOVERY: {
      title: 'We found an unfolded draft.',
      description: 'There is a newer version of this dispatch saved locally on this device.',
      primaryAction: 'Recover Draft',
      secondaryAction: 'Discard Local Draft',
      reassurance: 'You can restore the local snapshot or continue with the server version.',
    },
    DELETE_FAILED: {
      title: "That item couldn't be moved to Trash.",
      description: 'An error occurred during removal. The article remains in its current location.',
      primaryAction: 'Try Again',
      reassurance: 'No data was lost or corrupted.',
    },
  },

  SEARCH: {
    FAILED: {
      title: 'Looks like the search got folded.',
      description: "We couldn't complete your query across the archives right now.",
      primaryAction: 'Try Again',
      secondaryAction: 'Browse Categories',
      reassurance: 'The full directory of topics is available.',
    },
    EMPTY: {
      title: 'Nothing found in this fold.',
      description: "We couldn't find a dispatch matching those search terms. Try broader keywords or explore our curated collections.",
      primaryAction: 'Clear Search',
      secondaryAction: 'Explore All Stories',
    },
  },

  DOCUMENT: {
    PDF_FAILED: {
      title: 'Your article is safe, but the PDF could not be folded together.',
      description: 'The layout renderer encountered a formatting issue while preparing the PDF.',
      primaryAction: 'Try Again',
      secondaryAction: 'Back to Article',
      reassurance: 'Your complete story text, formatting, and metadata remain safe.',
    },
    DOCX_FAILED: {
      title: "We couldn't prepare the Word document.",
      description: 'Document export halted unexpectedly. Your article text is completely safe.',
      primaryAction: 'Try Again',
      secondaryAction: 'Back to Article',
      reassurance: 'Your article is intact in the CMS.',
    },
  },

  AUTH_PERMISSIONS: {
    UNAUTHORIZED: {
      title: 'Access restricted.',
      description: 'This area is reserved for authorized editorial and operations staff.',
      primaryAction: 'Sign In to Console',
      secondaryAction: 'Return Home',
    },
    FORBIDDEN: {
      title: 'Access restricted.',
      description: "This area isn't part of your current editorial role or permissions.",
      primaryAction: 'Back to Dashboard',
      reassurance: 'Contact an Owner if you need extended permissions.',
    },
    SESSION_EXPIRED: {
      title: 'Your session has folded away.',
      description: 'Please sign in again to continue your editorial work.',
      primaryAction: 'Sign In Again',
      reassurance: 'Your active draft has been backed up locally.',
    },
  },

  WEBSITE: {
    SAVE_FAILED: {
      title: "Couldn't save website updates.",
      description: 'The configuration could not be synced with the server right now.',
      primaryAction: 'Try Again',
      reassurance: 'All form fields and entered links remain populated in your browser.',
    },
  },

  CONCURRENCY: {
    CONFLICT: {
      title: 'This page has changed.',
      description: 'Another team member published an update while you were editing.',
      primaryAction: 'View Changes',
      secondaryAction: 'Keep My Version',
      reassurance: 'Your current edits are preserved in a local draft snapshot.',
    },
  },
};

/**
 * Generate unique traceable error ID
 * Format: TFP-XXXXXX
 */
export function generateErrorId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'TFP-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
