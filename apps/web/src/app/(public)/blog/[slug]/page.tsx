"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: { name: string; avatar: string | null };
  createdAt: string;
  readingTime: number;
  category: string;
}

export default function SingleBlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/blog/posts/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") setPost(data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="text-center py-24">Loading...</div>;
  if (!post) return <div className="text-center py-24">Post not found</div>;

  return (
    <div className="min-h-screen bg-[var(--cream-base)] py-12">
      <div className="container max-w-3xl">
        <Link href="/blog">
          <Button variant="ghost" className="mb-6 hover:bg-transparent pl-0 text-[var(--navy-mid)]">
            <ArrowLeft size={16} className="mr-2" /> Back to Blog
          </Button>
        </Link>
        <span className="badge badge-gold mb-4 inline-block">{post.category || "General"}</span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[var(--navy-deep)] leading-tight mb-6">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-[var(--text-muted)] mb-8 border-b border-[var(--border-light)] pb-8">
          <span className="font-semibold text-[var(--navy-mid)]">{post.author.name}</span>
          <span>•</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          <span>•</span>
          <span>{post.readingTime || 5} min read</span>
        </div>
        
        {post.coverImage && (
          <img src={post.coverImage} alt={post.title} className="w-full rounded-2xl mb-8 object-cover max-h-96" />
        )}

        <div className="prose prose-lg text-[var(--text-secondary)]">
          <p className="text-xl leading-relaxed font-medium text-[var(--navy-mid)] border-l-4 border-[var(--gold-primary)] pl-6 mb-8">
            {post.excerpt}
          </p>
          {post.content.split("\n\n").map((para, i) => {
            const trimmed = para.trim();
            if (trimmed.startsWith("“") && trimmed.endsWith("”")) {
              return (
                <blockquote key={i} className="border-l-4 border-[var(--gold-primary)] pl-6 italic my-8 text-xl text-[var(--navy-mid)] font-serif">
                  {trimmed}
                </blockquote>
              );
            }
            if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
              return <h4 key={i} className="text-2xl text-[var(--navy-deep)] font-serif font-bold mt-10 mb-4">{trimmed.replace(/\*\*/g, "")}</h4>;
            }
            const withBold = trimmed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
            return <p key={i} className="mb-5 text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: withBold }} />;
          })}
        </div>
      </div>
    </div>
  );
}
