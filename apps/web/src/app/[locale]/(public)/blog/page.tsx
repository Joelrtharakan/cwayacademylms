"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, User, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Animation Variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
} as const;

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: { name: string; avatar: string | null };
  createdAt: string;
  readingTime: number;
  category: string;
}

export default function BlogPage() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/blog/posts?published=true`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          setPosts(data.data);
        }
      })
      .catch(err => console.error("Failed to fetch blog posts:", err));
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedPost) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedPost]);

  return (
    <div className="overflow-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
        .blog-cards-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2.5rem;
        }
        .blog-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background-color: rgba(26, 38, 29, 0.7);
          backdrop-filter: blur(12px);
        }
        .blog-modal-panel {
          background-color: var(--cream-base);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
          max-width: 780px;
          width: 100%;
          max-height: 85vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        @media (max-width: 768px) {
          .blog-cards-grid { grid-template-columns: 1fr; gap: 1.5rem; }
          .blog-modal-overlay { padding: 0; align-items: flex-end; }
          .blog-modal-panel {
            max-width: 100vw;
            width: 100vw;
            max-height: 92vh;
            border-radius: var(--radius-xl) var(--radius-xl) 0 0;
          }
        }
        @media (max-width: 480px) {
          .blog-cards-grid { gap: 1.25rem; }
          .blog-modal-panel { max-height: 95vh; }
        }
      ` }} />
      {/* Hero */}
      <section
        className="section-padding border-b border-[var(--border-light)]"
        style={{
          background: "linear-gradient(180deg, #FBFBFA 0%, #FAFAF7 100%)",
        }}
      >
        <div className="container" style={{ maxWidth: "1200px" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="section-label">Academy Journal</div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-serif mb-6 leading-tight max-w-4xl">
              Insights & <span className="gradient-text-gold">Reflections</span>
            </h1>
            <div className="gold-divider gold-divider-left" />
            <p className="max-w-2xl text-lg md:text-xl text-[var(--text-secondary)] font-light leading-relaxed mt-6">
              Exploring the history, narratives, and spiritual legacies of pioneer leaders who shaped indigenous Christian ministry across South India.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Grid of Same-Sized Cards */}
      <section className="section-padding bg-[var(--cream-base)]">
        <div className="container" style={{ maxWidth: "1200px" }}>
          <motion.div
            className="blog-cards-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            {posts.map((post) => (
              <motion.article
                key={post.slug}
                variants={fadeUp}
                whileHover={{ y: -8 }}
                style={{
                  backgroundColor: "var(--cream-light)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-light)",
                  borderTop: "4px solid var(--gold-primary)",
                  boxShadow: "var(--shadow-sm)",
                  padding: "clamp(1.5rem, 5vw, 2.5rem)",
                  transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "480px",
                }}
                className="hover:border-[var(--gold-primary)] hover:shadow-lg"
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                    <span className="badge badge-gold">{post.category || "General"}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>

                  <h3
                    style={{
                      fontSize: "1.45rem",
                      color: "var(--navy-deep)",
                      fontFamily: "var(--font-serif)",
                      fontWeight: 700,
                      lineHeight: 1.35,
                      marginBottom: "1rem"
                    }}
                  >
                    {post.title}
                  </h3>

                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.95rem",
                      lineHeight: 1.65,
                      fontWeight: 300,
                      marginBottom: "1.5rem"
                    }}
                  >
                    {post.excerpt}
                  </p>
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", borderTop: "1px solid var(--border-light)", paddingTop: "1.25rem", marginBottom: "1.5rem" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, var(--navy-deep), var(--navy-mid))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ color: "var(--gold-light)", fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "0.85rem" }}>
                        {post.author.name?.[0] || "A"}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--navy-deep)" }}>{post.author.name}</div>
                    </div>
                    <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--text-muted)" }}>{post.readingTime || 5} min read</span>
                  </div>

                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                      onClick={() => setSelectedPost(post)}
                      style={{
                        flex: 1,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        padding: "0.875rem 1.5rem",
                        borderRadius: "50px",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        backgroundColor: "var(--navy-deep)",
                        color: "#FFFFFF",
                        border: "none",
                        cursor: "pointer",
                        transition: "all var(--transition-base)"
                      }}
                      className="hover:bg-[var(--gold-primary)]"
                    >
                      Read Full Story <ArrowRight size={15} />
                    </button>

                    <Link
                      href={`/blog/${post.slug}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0.875rem 1.25rem",
                        borderRadius: "50px",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        backgroundColor: "transparent",
                        color: "var(--gold-dark)",
                        border: "1px solid var(--border-light)",
                        textDecoration: "none",
                        transition: "all var(--transition-base)"
                      }}
                      className="hover:bg-[var(--cream-mid)]"
                    >
                      Share Link
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Reader Modal overlay */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="blog-modal-overlay"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="blog-modal-panel"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Sticky Header */}
              <div
                style={{
                  padding: "clamp(1.25rem, 4vw, 1.75rem) clamp(1.25rem, 5vw, 2rem)",
                  borderBottom: "1px solid var(--border-light)",
                  backgroundColor: "var(--cream-light)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "1.5rem"
                }}
              >
                <div>
                  <span className="badge badge-gold" style={{ marginBottom: "0.5rem", display: "inline-block" }}>{selectedPost.category || "General"}</span>
                  <h2
                    style={{
                      fontSize: "clamp(1.25rem, 3vw, 1.85rem)",
                      lineHeight: 1.3,
                      color: "var(--navy-deep)",
                      fontFamily: "var(--font-serif)",
                      fontWeight: 700
                    }}
                  >
                    {selectedPost.title}
                  </h2>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                    <span style={{ fontWeight: 600, color: "var(--navy-mid)" }}>{selectedPost.author.name}</span>
                    <span>•</span>
                    <span>{new Date(selectedPost.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{selectedPost.readingTime || 5} min read</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  style={{
                    padding: "0.5rem",
                    borderRadius: "50%",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    transition: "all var(--transition-fast)",
                    flexShrink: 0
                  }}
                  className="hover:bg-[var(--cream-mid)] hover:text-[var(--navy-deep)]"
                  aria-label="Close reader"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div
                data-lenis-prevent
                style={{
                  padding: "clamp(1.25rem, 5vw, 2rem) clamp(1.25rem, 6vw, 2.5rem)",
                  overflowY: "auto",
                  backgroundColor: "var(--cream-base)"
                }}
              >
                <div style={{ maxWidth: "680px", margin: "0 auto" }}>
                  {/* Lead excerpt */}
                  <p
                    style={{
                      fontSize: "1.1rem",
                      lineHeight: 1.8,
                      fontWeight: 500,
                      color: "var(--navy-mid)",
                      marginBottom: "2rem",
                      borderLeft: "3.5px solid var(--gold-primary)",
                      paddingLeft: "1.25rem"
                    }}
                  >
                    {selectedPost.excerpt}
                  </p>

                  {/* Render paragraphs dynamically */}
                  <div style={{ lineHeight: 1.9, color: "var(--text-secondary)" }}>
                    {selectedPost.content.split("\n\n").map((para, i) => {
                      const trimmed = para.trim();
                      if (trimmed.startsWith("“") && trimmed.endsWith("”")) {
                        return (
                          <blockquote
                            key={i}
                            style={{
                              borderLeft: "4px solid var(--gold-primary)",
                              paddingLeft: "1.5rem",
                              fontStyle: "italic",
                              margin: "2rem 0",
                              fontSize: "1.125rem",
                              color: "var(--navy-mid)",
                              fontFamily: "var(--font-serif)"
                            }}
                          >
                            {trimmed}
                          </blockquote>
                        );
                      }
                      if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
                        return (
                          <h4
                            key={i}
                            style={{
                              fontSize: "1.25rem",
                              color: "var(--navy-deep)",
                              fontFamily: "var(--font-serif)",
                              fontWeight: 700,
                              marginTop: "2.5rem",
                              marginBottom: "1rem"
                            }}
                          >
                            {trimmed.replace(/\*\*/g, "")}
                          </h4>
                        );
                      }
                      const withBold = trimmed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
                      return (
                        <p
                          key={i}
                          style={{ marginBottom: "1.25rem", fontSize: "1rem" }}
                          dangerouslySetInnerHTML={{ __html: withBold }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Sticky Footer */}
              <div
                style={{
                  padding: "1.25rem 2rem",
                  borderTop: "1px solid var(--border-light)",
                  backgroundColor: "var(--cream-light)",
                  display: "flex",
                  justifyContent: "flex-end"
                }}
              >
                <button
                  onClick={() => setSelectedPost(null)}
                  style={{
                    padding: "0.75rem 2rem",
                    borderRadius: "50px",
                    border: "1px solid var(--border-light)",
                    backgroundColor: "transparent",
                    color: "var(--text-secondary)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    transition: "all var(--transition-base)"
                  }}
                  className="hover:bg-[var(--cream-mid)] hover:text-[var(--navy-deep)]"
                >
                  Close Article
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Callout */}
      <section className="bg-[var(--navy-deep)] py-24 px-6 text-white text-center">
        <div className="container max-w-2xl mx-auto">
          <div className="gold-divider" />
          <h2 className="text-3xl font-bold font-serif mb-4">Support Our Frontline Leaders</h2>
          <p className="text-white/80 font-light leading-relaxed mb-8">
            Our historical posts reflect the sacrifice of early missionaries. Today, local leaders
            need training to protect remote rural churches. Become a part of their story.
          </p>
          <Link href="/get-involved" className="px-8 py-4 bg-[var(--gold-primary)] hover:bg-[var(--gold-dark)] text-white font-semibold rounded-full transition-all text-decoration-none">
            Partner With Us
          </Link>
        </div>
      </section>
    </div>
  );
}
