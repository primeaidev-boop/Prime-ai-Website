import api from './axios';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
  _count?: { posts: number };
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export interface BlogAuthor {
  id: string;
  name: string;
  designation?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  coverImageUrl?: string;
  status: 'DRAFT' | 'PUBLISHED';
  showAuthor: boolean;
  readTimeMin: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  category: BlogCategory;
  author: BlogAuthor;
  tags: BlogTag[];
}

export interface BlogListResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateBlogPostPayload {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  status: 'DRAFT' | 'PUBLISHED';
  showAuthor?: boolean;
  categoryId: string;
  authorId: string;
  tagIds: string[];
  publishedAt?: string;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function fetchPublicPosts(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}): Promise<BlogListResponse> {
  return api.get('/blog', { params }).then((r) => r.data);
}

export function fetchPostBySlug(slug: string): Promise<BlogPost> {
  return api.get(`/blog/${slug}`).then((r) => r.data);
}

export function fetchPublicCategories(): Promise<BlogCategory[]> {
  return api.get('/blog/categories').then((r) => r.data);
}

export function fetchPublicTags(): Promise<BlogTag[]> {
  return api.get('/blog/tags').then((r) => r.data);
}

export function fetchPublicAuthors(): Promise<BlogAuthor[]> {
  return api.get('/blog/authors').then((r) => r.data);
}

// ─── Admin API ───────────────────────────────────────────────────────────────

export function adminFetchPosts(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<BlogListResponse> {
  return api.get('/admin/blog', { params }).then((r) => r.data);
}

export function adminFetchPost(id: string): Promise<BlogPost> {
  return api.get(`/admin/blog/${id}`).then((r) => r.data);
}

export function adminCreatePost(payload: CreateBlogPostPayload): Promise<BlogPost> {
  return api.post('/admin/blog', payload).then((r) => r.data);
}

export function adminUpdatePost(id: string, payload: Partial<CreateBlogPostPayload>): Promise<BlogPost> {
  return api.patch(`/admin/blog/${id}`, payload).then((r) => r.data);
}

export function adminDeletePost(id: string): Promise<{ deleted: boolean }> {
  return api.delete(`/admin/blog/${id}`).then((r) => r.data);
}

// Categories
export function adminFetchCategories(): Promise<BlogCategory[]> {
  return api.get('/admin/blog/categories').then((r) => r.data);
}

export function adminCreateCategory(data: { name: string; slug: string; color?: string }): Promise<BlogCategory> {
  return api.post('/admin/blog/categories', data).then((r) => r.data);
}

export function adminDeleteCategory(id: string): Promise<{ deleted: boolean }> {
  return api.delete(`/admin/blog/categories/${id}`).then((r) => r.data);
}

// Tags
export function adminFetchTags(): Promise<BlogTag[]> {
  return api.get('/admin/blog/tags').then((r) => r.data);
}

export function adminCreateTag(data: { name: string; slug: string }): Promise<BlogTag> {
  return api.post('/admin/blog/tags', data).then((r) => r.data);
}

export function adminDeleteTag(id: string): Promise<{ deleted: boolean }> {
  return api.delete(`/admin/blog/tags/${id}`).then((r) => r.data);
}

// Authors
export function adminFetchAuthors(): Promise<BlogAuthor[]> {
  return api.get('/admin/blog/authors').then((r) => r.data);
}

export function adminCreateAuthor(data: { name: string; designation?: string; bio?: string; avatarUrl?: string }): Promise<BlogAuthor> {
  return api.post('/admin/blog/authors', data).then((r) => r.data);
}

export function adminUpdateAuthor(id: string, data: { name?: string; designation?: string; bio?: string; avatarUrl?: string }): Promise<BlogAuthor> {
  return api.patch(`/admin/blog/authors/${id}`, data).then((r) => r.data);
}

export function adminDeleteAuthor(id: string): Promise<{ deleted: boolean }> {
  return api.delete(`/admin/blog/authors/${id}`).then((r) => r.data);
}

// Media
export function uploadMedia(
  file: File,
  variant: 'cover' | 'content' | 'avatar' = 'cover',
): Promise<{ url: string; originalSizeKb: number; convertedSizeKb: number; width: number; height: number }> {
  const form = new FormData();
  form.append('file', file);
  return api.post(`/admin/media/upload?variant=${variant}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
}

/**
 * Fetches an external image URL (Google Drive share link, etc.) server-side
 * and re-hosts it under our own domain, returning the new permanent URL.
 * Use this instead of saving a Drive/Photos URL directly - those are not a
 * CDN and can fail intermittently per-visitor even when correctly shared.
 */
export function fetchMediaFromUrl(
  url: string,
  variant: 'cover' | 'content' | 'avatar' = 'content',
): Promise<{ url: string; originalSizeKb: number; convertedSizeKb: number; width: number; height: number }> {
  return api.post('/admin/media/fetch-url', { url, variant }).then((r) => r.data);
}
