
import { getBlogPosts, deleteBlogPost } from "@/lib/actions/blog";
import { getResources, deleteResource } from "@/lib/actions/resource";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Edit, Plus, Trash2, Eye, FileText, BookOpen, Download } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export default async function CMSPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; tab?: string }> }) {
    const { page, search, tab = "blog" } = await searchParams;
    const currentPage = Number(page) || 1;
    const limit = 10;

    const blogResponse = await getBlogPosts(currentPage, limit, search);
    const resourceResponse = await getResources(currentPage, limit, search);

    const posts = blogResponse.posts || [];
    const resources = resourceResponse.resources || [];
    const totalBlogPages = blogResponse.totalPages || 0;
    const totalResourcePages = resourceResponse.totalPages || 0;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center bg-card p-6 rounded-xl border shadow-sm">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-extrabold tracking-tight">Content Management</h1>
                    <p className="text-muted-foreground">Manage your educational guides, case studies, and blog articles.</p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="mr-2 h-4 w-4" /> Create Content <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem asChild>
                            <Link href="/admin/cms/create" className="cursor-pointer">
                                <FileText className="mr-2 h-4 w-4" /> Blog Post
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/admin/cms/create?type=resource" className="cursor-pointer">
                                <BookOpen className="mr-2 h-4 w-4" /> GeM Guide / Resource
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Tabs defaultValue={tab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="blog" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Blog Posts
                    </TabsTrigger>
                    <TabsTrigger value="resources" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" /> Guides & Resources
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="blog" className="mt-6">
                    <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="font-bold">Title</TableHead>
                                    <TableHead className="font-bold">Slug</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="font-bold">Views</TableHead>
                                    <TableHead className="font-bold">Published Date</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {posts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-32 text-muted-foreground italic">
                                            No blog posts found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    posts.map((post) => {
                                        const isScheduled = post.published && post.publishedAt && new Date(post.publishedAt) > new Date();
                                        const status = isScheduled ? "Scheduled" : (post.published ? "Published" : "Draft");
                                        const statusVariant = isScheduled ? "outline" : (post.published ? "default" : "secondary");

                                        return (
                                            <TableRow key={post.id} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="font-semibold text-primary">{post.title}</TableCell>
                                                <TableCell className="text-muted-foreground text-sm">{post.slug}</TableCell>
                                                <TableCell>
                                                    <Badge variant={statusVariant} className="rounded-full px-2.5 py-0.5">
                                                        {status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5 font-medium">
                                                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                                        {(post as any).views || 0}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {post.publishedAt ? format(new Date(post.publishedAt), "PPP") : "N/A"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <form action={async () => {
                                                            "use server";
                                                            const { toggleBlogPostPublish } = await import("@/lib/actions/blog");
                                                            await toggleBlogPostPublish(post.id);
                                                        }}>
                                                            <Button variant="outline" size="sm" type="submit" className="h-8 text-xs font-semibold">
                                                                {post.published ? "Unpublish" : "Publish"}
                                                            </Button>
                                                        </form>

                                                        <Button variant="ghost" size="icon" asChild title="View">
                                                            <Link href={`/blog/${post.slug}`} target="_blank">
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="ghost" size="icon" asChild title="Edit" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                                            <Link href={`/admin/cms/${post.id}`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <form action={async () => {
                                                            "use server";
                                                            await deleteBlogPost(post.id);
                                                        }}>
                                                            <Button variant="ghost" size="icon" type="submit" title="Delete" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </form>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {totalBlogPages > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                            <PaginationButtons currentPage={currentPage} totalPages={totalBlogPages} tab="blog" />
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="resources" className="mt-6">
                    <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="font-bold">Title</TableHead>
                                    <TableHead className="font-bold">Type</TableHead>
                                    <TableHead className="font-bold">Topic</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="font-bold text-center">Engagement</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {resources.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-32 text-muted-foreground italic">
                                            No resources found. Upload a GeM guide or case study.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    resources.map((resource) => (
                                        <TableRow key={resource.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="font-semibold text-primary">
                                                <div className="flex flex-col">
                                                    {resource.title}
                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                                                        Audience: {resource.audience || 'Any'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize bg-blue-50 text-blue-700 border-blue-200">
                                                    {resource.type.toLowerCase().replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm font-medium">{resource.topic || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge variant={resource.published ? "default" : "secondary"} className="rounded-full">
                                                    {resource.published ? "Published" : "Draft"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="flex items-center gap-1.5 text-xs font-medium">
                                                        <Eye className="h-3 w-3 text-muted-foreground" />
                                                        {(resource as any).views || 0} views
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs font-medium">
                                                        <Download className="h-3 w-3 text-muted-foreground" />
                                                        {(resource as any).downloads || 0} dls
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <form action={async () => {
                                                        "use server";
                                                        const { toggleResourcePublish } = await import("@/lib/actions/resource");
                                                        await toggleResourcePublish(resource.id);
                                                    }}>
                                                        <Button variant="outline" size="sm" type="submit" className="h-8 text-xs font-semibold">
                                                            {resource.published ? "Unpublish" : "Publish"}
                                                        </Button>
                                                    </form>

                                                    <Button variant="ghost" size="icon" asChild title="Edit" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                                        <Link href={`/admin/cms/${resource.id}?type=resource`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <form action={async () => {
                                                        "use server";
                                                        await deleteResource(resource.id);
                                                    }}>
                                                        <Button variant="ghost" size="icon" type="submit" title="Delete" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </form>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {totalResourcePages > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                            <PaginationButtons currentPage={currentPage} totalPages={totalResourcePages} tab="resources" />
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

function PaginationButtons({ currentPage, totalPages, tab }: { currentPage: number; totalPages: number; tab: string }) {
    return (
        <>
            {currentPage > 1 && (
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/cms?page=${currentPage - 1}&tab=${tab}`}>Previous</Link>
                </Button>
            )}
            <div className="flex items-center text-sm font-medium px-4">
                Page {currentPage} of {totalPages}
            </div>
            {currentPage < totalPages && (
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/cms?page=${currentPage + 1}&tab=${tab}`}>Next</Link>
                </Button>
            )}
        </>
    );
}
