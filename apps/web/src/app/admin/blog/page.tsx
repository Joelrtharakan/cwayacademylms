"use client";

import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { api } from "@/store/auth.store";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  createdAt: string;
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await api.get("/blog/posts");
      setPosts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const deletePost = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/blog/posts/${slug}`);
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <PageHeader title="Blog Posts" subtitle="Manage editorial content published on CWAY Academy" />
        <Link href="/admin/blog/new">
          <Button className="bg-[#B88645] hover:bg-[#A3753A] text-white">
            <Plus size={16} className="mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8EBE4] overflow-hidden">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-[#F5F7F3] text-[#4A5B4D] font-medium border-b border-[#E8EBE4]">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-[#E8EBE4] hover:bg-[#F9FAF8]">
                  <td className="px-6 py-4 font-medium text-[#1A261D]">{post.title}</td>
                  <td className="px-6 py-4">
                    {post.isPublished ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle size={14} className="mr-1" /> Published
                      </span>
                    ) : (
                      <span className="flex items-center text-gray-500">
                        <XCircle size={14} className="mr-1" /> Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[#8F9E93]">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/blog/${post.slug}`}>
                      <Button variant="ghost" size="sm" className="mr-2">
                        <Edit2 size={16} className="text-[#8F9E93]" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => deletePost(post.slug)}>
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[#8F9E93]">
                    No blog posts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
