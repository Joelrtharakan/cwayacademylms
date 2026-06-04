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
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  scripture: {
    text: string;
    reference: string;
  };
}

const posts: Post[] = [
  {
    slug: "arulappan-indigenous-leadership",
    title: "Arulappan: A Pioneer of Indigenous Leadership Training in India",
    excerpt: "John Christian Arulappan was a Tamil evangelist who led one of the earliest Pentecostal revivals in South India and pioneered local training for indigenous church leaders in the 19th century.",
    content: `Pastor Bill Hybels, a pastor of one of the largest evangelical churches in the world, wrote in his book ‘Courageous Leadership’ that "the local church is the hope of the world, and its future rests primarily in the hands of its leaders.” As we see in the letter of the Apostle Paul to the church at Ephesus, he wrote about “equipping of the saints for the work of ministry, for the edifying of the body of Christ” (Ephesians 4:11-13). He encouraged the church to train local leaders “to the unity of the faith and of the knowledge of the Son of God, to a perfect man, to the measure of the stature of the fullness of Christ.”

What do you think? When did the Indian Christian community adopt an indigenous system of leadership training? Do you know that Pentecostal-Charismatic leadership training for local churches and leaders in India was initiated by a local pastor?

I want you to study an episode in the history of Charismatic Christianity in South India that reveals an individual who pioneered local training for indigenous church leaders in the nineteenth century.

John Christian Arulappan was a Tamil evangelist who led one of the earliest Pentecostal revivals in South India during 1860-65 and trained local Christians for indigenous churches. Arulappan, a young man from the village of Strivelliputtoor, joined the seminary of the Church Missionary Society in Tirunelveli in 1825 and studied under the German missionary C.T.E. Rhenius. He later worked with Anthony Groves, a British missionary, as a translator and evangelist. During this time, he faced criticism from local people who said, “he was hired for preaching.” However, Arulappan refused any form of remuneration from Groves and lived "by faith."

Arulappan’s Spirit-led vision empowered local Christians to share ministerial responsibilities, embrace the apostolic pattern of leadership, engage in faith missions, and adopt a communitarian lifestyle. He established a Christian settlement near his native place and transformed it into a self-supporting agricultural village that included a printing press, a boarding school, a church, and a center for Bible training. Arulappan established churches in the surrounding areas, and those congregations were independent, self-supporting, and locally managed. He was an itinerant trainer who passionately taught about the suffering, death, resurrection, and return of Lord Jesus Christ. Amid people's suffering due to famine, he exhorted them to "seek first the kingdom of God," and God miraculously supplied their needs.

The Missionary Reporter of 1860 reported on revivals in Britain and America in recent years, and Arulappan had been reading about them. He enthusiastically trained local leaders of his churches to earnestly pray and work for a similar revival in South India. He told them, “look for the Holy Spirit, let us pray for the Holy Spirit; let every one of us do the same.” Between May and August 1860, a revival with "Pentecostal" characteristics occurred in Tirunelveli. Arulappan described the events as “the Holy Ghost poured out openly and wonderfully…some prophesied, and some spoke in unknown tongues with their interpretations." Many people were baptized after receiving the Holy Spirit, and he continued to teach from the early chapters of Acts to extend the outpouring of the Holy Spirit among the locals.

Arulappan was a true pioneer and visionary who believed in local training for Christian leaders. He was a local pastor and Christian leader with the vision to train and produce Christian leaders for the future church in India. The impact of his training and the Tirunelveli revival continues to this day, as we have many Pentecostal-Charismatic Christian leaders and churches in South India.`,
    author: "Dr. Reeju Tharakan",
    authorRole: "M.Th., Ph.D.",
    date: "March 16, 2026",
    readTime: "6 min",
    category: "History",
    tags: ["Arulappan", "Indigenous", "Leadership", "India", "Tirunelveli"],
    scripture: {
      text: "equipping of the saints for the work of ministry, for the edifying of the body of Christ",
      reference: "Ephesians 4:12"
    }
  },
  {
    slug: "mary-chapmans-resolve",
    title: "“They Will Not Go, I Must” — The Legacy of Mary Chapman",
    excerpt: "Mary Weems Chapman, a 60-year-old veteran missionary, became the first Assemblies of God missionary to India, pioneering children's homes and local leadership training in Kerala.",
    content: `“They will not go, I must” were the words of Mary Weems Chapman, a 60-year-old veteran missionary who, in 1915, became the first Assemblies of God missionary to India. Mary Chapman was a Free Methodist missionary before her association with the Assemblies of God, and she worked in Liberia and India. Between 1890 and 1900, Mary worked in Daund, Pune, Mumbai, and Doddaballapur near Bangalore, and she was heavily involved in the ministry of children’s homes, which provided education and moral support to underprivileged children. After spending some years in India, single and aging, she returned to the United States of America. In 1915, she felt the call of God to return to India as a missionary from the Assemblies of God fellowship. However, her family and friends discouraged her, saying she was too old to go back to India. Nevertheless, she persevered in her resolve and made her decision firm, and she became the first Assemblies of God missionary to India. Before leaving the U.S. for India, she said: "The Spirit of God will not permit me to remain at home in a life of ease while souls are perishing…if young people are not able to go, old people must go."

Mary Chapman arrived in India in October 1915 and had a vision that women and little girls in South India should lead the people of India to the experience of the new birth, Baptism in the Holy Spirit, divine healing, and baptism by immersion. She earnestly prayed for revival in India. From September 1917, Chapman visited Kerala and conducted meetings in Trivandrum. She raised a team of local leaders in Kerala, including Manessah, Mathew, Jaborathanam Daniel, and Jacob; later, they served as leaders of the Assemblies of God mission in South Kerala. She initiated a training center in Kerala for indigenous leaders. It later grew into a full-fledged Bible School. She envisioned the training and development of local church leaders in India. In the twentieth century, this training of local leaders impacted the development of many Pentecostal-Charismatic leaders in India. Training leaders for the local church has been a vision for many Christian institutions and organizations.

John Maxwell made the leadership statement, “Everything rises and falls on leadership.” This statement has become especially significant in today’s church context in India, where there appears to be a shortage of trained pastors and local leaders. Because of India’s many ethnic groups and languages, training Christian leaders has become the most challenging task for churches and theological institutions. There are thousands of untrained pastors and lay leaders in remote villages in India who have never had the opportunity for formal leadership training or theological education. The poor financial status of churches and families, along with the lack of training programs in local languages, always hinders local pastors and leaders from enrolling in theological education or Christian leadership programs. What can we do for them?`,
    author: "Dr. Reeju Tharakan",
    authorRole: "M.Th., Ph.D.",
    date: "April 28, 2026",
    readTime: "7 min",
    category: "Missions",
    tags: ["Mary Chapman", "Assemblies of God", "Missions", "India", "Kerala"],
    scripture: {
      text: "The Spirit of God will not permit me to remain at home in a life of ease while souls are perishing…if young people are not able to go, old people must go.",
      reference: "Mary Weems Chapman"
    }
  },
  {
    slug: "obedience-will-of-god-the-garrs",
    title: "Obedience to the Will of God — The Garrs",
    excerpt: "Alfred and Lillian Garr were model missionaries who obeyed God's will to bring the Pentecostal message to India in 1906, sparking a revival across Calcutta, Pune, and Bombay.",
    content: `Growing in the grace and wisdom of God means finding favor with God and obeying His will. The first men and women who experienced baptism in the Holy Spirit at the beginning of the twentieth century were growing in the grace and wisdom of God. Some of them obeyed God's will and became the first Pentecostal missionaries to India.

Alfred Goodrich Garr of Danville, Kentucky, was passionately seeking a personal encounter with God, which he always told his mother, “I am feeling after God.” In his continued pursuit of God, he traveled to several places, attended many meetings, and later joined Asbury College for ministerial training. Garr married Lillian Anderson, daughter of a Methodist bishop, while at Asbury College. They then moved to California to become pastors of an independent congregation, the Burning Bush Church. Although he was established as a pastor of this church, his desire for a deeper relationship with God continued. During this time, the Azusa Street Revival broke out, and Garr attended every session enthusiastically. On June 14, 1906, Garr received baptism in the Holy Spirit with speaking in tongues. At one meeting, while he was speaking in tongues, a British Indian approached him and said that Garr was speaking his mother tongue, Bengali. Initially, Lillian was skeptical about taking this experience as divine, and Garr asked her to attend one session of the Azusa Street Revival. Mrs. Garr received the power of the Holy Spirit with the gift of tongues, Tibetan and Chinese, in her first meeting at the Azusa mission. One week later, Garr stood up in one of the sessions of the Azusa Revival and said, “Friends, I believe that God wants me to go to India with this message.”

A. G. Garr and Lillian Garr, with their daughter Virginia and their assistant Maria Gardner, arrived in Calcutta in December 1906. For the first three weeks, this missionary couple prayed for an opening to begin their ministry. During this time, Garr realized that he could not use the ‘Bengali’ language he had received as a gift of tongues at the Azusa Street Revival for preaching in Calcutta. However, he was not discouraged; instead, he studied the scriptures and came to understand that speaking in tongues was a source of spiritual empowerment rather than a tool for missionary evangelism. They were then invited to attend a prayer meeting of missionaries at the Woman’s Union Missionary Society mission house on Dhurmutulla Street to share about ‘God’s visitation in America.’ The missionaries who attended this meeting received the baptism of the Spirit. Later, Garr met Pastor Hook of the Bow Bazar Baptist Church – the church William Carey had ministered to 100 years earlier. The Garrs conducted revival meetings at this church with Pastor Hook. Some Protestant missionaries and local Christians experienced the power of the Holy Spirit.

Lillian Garr reported on this revival in the periodical Apostolic Faith of the Azusa Street Mission: “God is spreading Pentecost in Calcutta, … We are among the Bible teachers, and they have the Word so stored away; but now the Spirit is putting life and power into it, which is wonderful to behold.” One night in Calcutta, Sister Lillian Garr had a vision of Jesus, His hands filled with golden crowns ready to place on heads. She realized that God had put a burden on her heart for the hungry souls in India. The Garrs began praying for missionaries in India to receive the outpouring of the Holy Spirit. She initiated revival prayer meetings among the missionary ladies in Calcutta. Miss Susan Easton, head of the American Women’s Board of Missions, and Fanny Simpson, a Methodist missionary and director of a girls’ orphanage, received the Holy Spirit's empowerment in these meetings. At Miss Simpson's orphanage, forty-five native girls prayed and received the Spirit’s baptism. These girls became local ministers and witnessed the power of the gospel in their families and villages. The revival continued to spread in Calcutta, Pune, and Bombay. The Garrs visited and conducted revival meetings at Ramabai’s Mukti Sadan in Pune and at a boys’ home in Dhond. The Garrs family went from Calcutta to Sri Lanka, then to Hong Kong and China. Despite personal tragedy, including the deaths of their two daughters and their assistant Maria, they continued the work of the Lord in China until 1911.

Alfred and Lillian Garr were a model missionary family who had grown in the grace and wisdom of God. They obeyed God's will in their lives and accepted their challenging experiences as God-given for the glory of God. The impact of their lives and ministry will endure forever.`,
    author: "Dr. Reeju Tharakan",
    authorRole: "M.Th., Ph.D.",
    date: "May 15, 2026",
    readTime: "8 min",
    category: "History",
    tags: ["A.G. Garr", "Azusa Street", "Missions", "Calcutta", "Revival"],
    scripture: {
      text: "Friends, I believe that God wants me to go to India with this message.",
      reference: "Alfred Goodrich Garr"
    }
  }
];

export default function BlogPage() {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

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
                    <span className="badge badge-gold">{post.category}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>{post.date}</span>
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
                        {post.author[0]}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--navy-deep)" }}>{post.author}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{post.authorRole}</div>
                    </div>
                    <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--text-muted)" }}>{post.readTime} read</span>
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
                  <span className="badge badge-gold" style={{ marginBottom: "0.5rem", display: "inline-block" }}>{selectedPost.category}</span>
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
                    <span style={{ fontWeight: 600, color: "var(--navy-mid)" }}>{selectedPost.author}</span>
                    <span>•</span>
                    <span>{selectedPost.authorRole}</span>
                    <span>•</span>
                    <span>{selectedPost.date}</span>
                    <span>•</span>
                    <span>{selectedPost.readTime} read</span>
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
