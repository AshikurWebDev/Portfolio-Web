import type { DesignPost } from '../types/content'

/*
  Local design samples, used only when the API is off or has no designs yet.
  Normally designs are managed in the admin at /admin/design. Export designs from the Educatory page into
  web/public/media/design/ and list them here:

  { id: 'admission-2026', imageUrl: '/media/design/admission-2026.webp',
    caption: 'Admission poster, 2026', permalink: 'https://www.facebook.com/educatorybd' }

  The gallery stays hidden while this list is empty and the API returns nothing.
*/
export const designPosts: DesignPost[] = []
