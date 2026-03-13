import type { Post } from "../db/queries.js";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const DEMO_ORG_ID = "demo";

export const demoPosts: Post[] = [
  {
    id: "demo-post-1",
    organization_id: DEMO_ORG_ID,
    linkedin_post_id: "demo-li-001",
    content:
      "We're thrilled to announce our Series B funding of $45M! This investment will fuel our mission to make developer tools more accessible. A huge thank you to our team, customers, and investors who believe in our vision. The future of Acme Technologies is brighter than ever. #startup #funding #devtools",
    media_url: "https://picsum.photos/seed/feeder1/800/400",
    media_type: "image",
    author_name: "Sarah Chen",
    author_avatar: "https://i.pravatar.cc/150?u=sarah-chen",
    published_at: daysAgo(2),
    likes_count: 487,
    comments_count: 73,
    shares_count: 45,
    raw_data: null,
    fetched_at: new Date().toISOString(),
    linkedin_url: "",
  },
  {
    id: "demo-post-2",
    organization_id: DEMO_ORG_ID,
    linkedin_post_id: "demo-li-002",
    content:
      "Introducing Acme Cloud Platform 3.0 — our biggest release yet! New features include real-time collaboration, AI-powered code suggestions, and a completely redesigned dashboard. Try it free for 30 days. Link in comments.",
    media_url: "https://picsum.photos/seed/feeder2/800/400",
    media_type: "image",
    author_name: "James Rodriguez",
    author_avatar: "https://i.pravatar.cc/150?u=james-rodriguez",
    published_at: daysAgo(5),
    likes_count: 312,
    comments_count: 56,
    shares_count: 38,
    raw_data: null,
    fetched_at: new Date().toISOString(),
    linkedin_url: "",
  },
  {
    id: "demo-post-3",
    organization_id: DEMO_ORG_ID,
    linkedin_post_id: "demo-li-003",
    content:
      "Meet our Employee of the Quarter: Priya Sharma from our Engineering team! Priya led the migration of our core infrastructure to Kubernetes, reducing deployment times by 70%. Her dedication and technical excellence inspire everyone at Acme Technologies. Congratulations, Priya! 🎉",
    media_url: null,
    media_type: null,
    author_name: "Acme Technologies",
    author_avatar: "https://i.pravatar.cc/150?u=acme-tech",
    published_at: daysAgo(8),
    likes_count: 198,
    comments_count: 42,
    shares_count: 12,
    raw_data: null,
    fetched_at: new Date().toISOString(),
    linkedin_url: "",
  },
  {
    id: "demo-post-4",
    organization_id: DEMO_ORG_ID,
    linkedin_post_id: "demo-li-004",
    content:
      "5 trends shaping enterprise software in 2026:\n\n1. AI-native workflows replacing manual processes\n2. Edge computing for real-time data processing\n3. Zero-trust security as the default\n4. Low-code platforms empowering non-technical teams\n5. Sustainability-driven architecture decisions\n\nWhich trend are you most excited about? Let us know in the comments.",
    media_url: "https://picsum.photos/seed/feeder4/800/400",
    media_type: "image",
    author_name: "David Park",
    author_avatar: "https://i.pravatar.cc/150?u=david-park",
    published_at: daysAgo(14),
    likes_count: 156,
    comments_count: 34,
    shares_count: 28,
    raw_data: null,
    fetched_at: new Date().toISOString(),
    linkedin_url: "",
  },
  {
    id: "demo-post-5",
    organization_id: DEMO_ORG_ID,
    linkedin_post_id: "demo-li-005",
    content:
      "We're hosting our annual DevConnect conference on April 15-17! Join 2,000+ developers for workshops, talks, and networking. Early bird tickets are available now. Featured speakers include industry leaders from across the tech ecosystem. See you there!",
    media_url: "https://picsum.photos/seed/feeder5/800/400",
    media_type: "image",
    author_name: "Acme Technologies",
    author_avatar: "https://i.pravatar.cc/150?u=acme-tech",
    published_at: daysAgo(20),
    likes_count: 89,
    comments_count: 21,
    shares_count: 15,
    raw_data: null,
    fetched_at: new Date().toISOString(),
    linkedin_url: "",
  },
  {
    id: "demo-post-6",
    organization_id: DEMO_ORG_ID,
    linkedin_post_id: "demo-li-006",
    content:
      "We're hiring! Acme Technologies is looking for talented engineers, designers, and product managers to join our growing team. We offer remote-first culture, competitive compensation, and the chance to work on products used by millions. Check out our open positions and apply today.",
    media_url: null,
    media_type: null,
    author_name: "Lisa Thompson",
    author_avatar: "https://i.pravatar.cc/150?u=lisa-thompson",
    published_at: daysAgo(27),
    likes_count: 67,
    comments_count: 18,
    shares_count: 9,
    raw_data: null,
    fetched_at: new Date().toISOString(),
    linkedin_url: "",
  },
];
