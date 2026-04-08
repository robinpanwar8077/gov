import { getPublishedBlogPosts, getBlogCategories } from "@/lib/actions/blog";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BlogFilters } from "./_components/blog-filters";
import { Calendar, User, ArrowRight, Rss, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
    title: "GovProNet Blog | Insights for GeM Vendors & OEMs",
    description: "Stay updated with the latest GeM news, procurement tips, success stories and industry insights.",
};

export default async function BlogPage({
    searchParams
}: {
    searchParams: Promise<{
        page?: string;
        category?: string;
        search?: string
    }>
}) {
    const { page, category, search } = await searchParams;
    const currentPage = Number(page) || 1;
    const limit = 12;

    const [postsRes, categoriesRes] = await Promise.all([
        getPublishedBlogPosts(currentPage, limit, {
            category,
            search
        }),
        getBlogCategories()
    ]);

    const posts = postsRes.posts || [];
    const categories = categoriesRes.categories || [];
    const totalPages = postsRes.totalPages || 0;

    return (
        <div className="container mx-auto py-12 px-4 md:px-6 min-h-screen">
            <div className="flex flex-col items-center text-center mb-12 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-2">
                    <Rss className="h-4 w-4" />
                    Knowledge Hub
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Latest from GovProNet</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Expert insights, GeM updates, and success stories to help your business grow in the government procurement space.
                </p>
            </div>

            <BlogFilters categories={categories} />

            {posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <Card key={post.id} className="group flex flex-col h-full border-muted-foreground/10 hover:border-primary/50 transition-all hover:shadow-xl overflow-hidden bg-card">
                            {post.coverImage && (
                                <div className="aspect-video relative overflow-hidden bg-muted">
                                    <img
                                        src={post.coverImage}
                                        alt={post.title}
                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {post.categories && post.categories.length > 0 && (
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            <Badge className="bg-primary/90 backdrop-blur-sm border-none shadow-sm">
                                                {post.categories[0].name}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            )}
                            <CardHeader className="pt-6">
                                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                                    <div className="flex items-center gap-1.5 font-medium text-primary">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {format(new Date(post.publishedAt || post.createdAt), "MMM d, yyyy")}
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                    <div className="flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5" />
                                        Team GP
                                    </div>
                                </div>
                                <CardTitle className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grow">
                                <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                                    {post.excerpt || (post.content.length > 150 ? post.content.substring(0, 150) + "..." : post.content)}
                                </p>
                            </CardContent>
                            <CardFooter className="pt-4 pb-6 px-6">
                                <Button asChild variant="ghost" className="p-0 h-auto font-bold text-primary hover:bg-transparent hover:text-primary/80 group/btn">
                                    <Link href={`/blog/${post.slug}`} className="flex items-center gap-2">
                                        Read Full Article
                                        <ArrowRight className="h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-muted/20 rounded-3xl border border-dashed border-muted-foreground/20">
                    <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-2xl font-bold mb-2">No articles found</h3>
                    <p className="text-muted-foreground text-center max-w-md px-6">
                        We couldn't find any articles matching your search. Try adjusting your filters or search terms.
                    </p>
                    <Button variant="link" asChild size="lg" className="mt-4 font-bold">
                        <Link href="/blog">View all articles</Link>
                    </Button>
                </div>
            )}

            {(totalPages || 0) > 1 && (
                <div className="flex justify-center items-center gap-4 mt-16 pb-12">
                    {currentPage > 1 && (
                        <Button variant="outline" asChild size="lg" className="rounded-xl px-6">
                            <Link href={`/blog?page=${currentPage - 1}${category ? `&category=${category}` : ''}${search ? `&search=${search}` : ''}`}>
                                Previous
                            </Link>
                        </Button>
                    )}

                    <div className="flex items-center justify-center h-10 px-4 rounded-xl bg-muted/50 text-sm font-bold tracking-widest uppercase text-muted-foreground border">
                        Page {currentPage} of {totalPages}
                    </div>

                    {currentPage < (totalPages || 0) && (
                        <Button variant="outline" asChild size="lg" className="rounded-xl px-6">
                            <Link href={`/blog?page=${currentPage + 1}${category ? `&category=${category}` : ''}${search ? `&search=${search}` : ''}`}>
                                Next
                            </Link>
                        </Button>
                    )}
                </div>
            )}

            <div className="mt-20 relative rounded-3xl overflow-hidden bg-primary p-8 md:p-16 text-center text-primary-foreground shadow-2xl">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-black/10 rounded-full blur-3xl" />

                <div className="relative z-10 space-y-6">
                    <h2 className="text-3xl md:text-4xl font-extrabold">Build Your GeM Success Story</h2>
                    <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg leading-relaxed">
                        Join thousands of verified vendors and OEMs on GovProNet. Get access to exclusive networking, verified leads, and expert guidance.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                        <Button size="lg" variant="secondary" asChild className="rounded-full px-10 h-14 font-bold text-lg shadow-lg">
                            <Link href="/signup">Join the Network</Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild className="rounded-full px-10 h-14 font-bold text-lg bg-white/5 border-white/20 hover:bg-white/10">
                            <Link href="/directory">Browse Directory</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
