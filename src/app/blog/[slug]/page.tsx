import { getBlogPostBySlug } from "@/lib/actions/blog";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ViewTracker } from "@/components/analytics/view-tracker";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Using getBlogPostBySlug which is public
    const { post } = await getBlogPostBySlug(slug);

    if (!post) {
        return notFound();
    }

    // Check visibility: Published must be true AND date must be in the past (unless admin)
    const isScheduled = post.publishedAt && new Date(post.publishedAt) > new Date();
    const isVisible = post.published && !isScheduled;

    // Check if user is admin for preview
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    const isAdmin = session?.role === "ADMIN";

    if (!isVisible && !isAdmin) {
        return notFound();
    }

    return (
        <div className="container mx-auto py-10 px-4 md:px-6 max-w-7xl ">
            <ViewTracker id={post.id} type="blog" />
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-muted-foreground mb-8">
                <Link href="/" className="hover:text-primary transition-colors">
                    Home
                </Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <Link href="/blog" className="hover:text-primary transition-colors">
                    Blogs
                </Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="text-foreground font-medium truncate max-w-[200px] md:max-w-[400px]">
                    {post.title}
                </span>
            </nav>

            <Button variant="ghost" asChild className="mb-8 pl-0 hover:bg-transparent hover:text-primary -ml-2">
                <Link href="/blog" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Blogs
                </Link>
            </Button>

            <article className="prose prose-slate dark:prose-invert lg:prose-xl mx-auto max-w-5xl">
                {post.coverImage && (
                    <div className="rounded-xl overflow-hidden mb-8 border shadow-sm aspect-video relative bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover m-0"
                        />
                    </div>
                )}

                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 mt-0!">{post.title}</h1>

                <div className="flex items-center gap-4 text-muted-foreground mb-8 not-prose border-b pb-8">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                            GP
                        </div>
                        <span className="text-sm font-medium">GovProNet Team</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <time className="text-sm">
                        {format(new Date(post.createdAt), "MMMM d, yyyy")}
                    </time>
                </div>

                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {post.content}
                </ReactMarkdown>
            </article>
        </div>
    );
}
