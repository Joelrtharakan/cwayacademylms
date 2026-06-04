import Link from "next/link";
import { notFound } from "next/navigation";
import { User, Clock, Tag, ArrowLeft, ChevronRight } from "lucide-react";

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
    tags: ["Mary Chapman", "Missions", "India", "Kerala", "History"],
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

export async function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: `${post.title} | CWAY Academy Journal`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article" },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ background: "var(--cream-mid)", padding: "1rem 0", borderBottom: "1px solid var(--border-light)" }}>
        <div className="container" style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.82rem", color: "var(--text-muted)", maxWidth: "760px", margin: "0 auto", padding: "0 1rem" }}>
          <Link href="/blog" style={{ color: "var(--gold-dark)", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
            <ArrowLeft size={13} /> Journal
          </Link>
          <ChevronRight size={12} />
          <span style={{ color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "300px" }}>{post.title}</span>
        </div>
      </div>

      {/* Hero */}
      <section className="parchment-bg" style={{ paddingTop: "clamp(2.5rem, 6vw, 4rem)", paddingBottom: "clamp(1.5rem, 4vw, 2.5rem)" }}>
        <div className="container" style={{ maxWidth: "760px", margin: "0 auto", padding: "0 1rem" }}>
          <span className="badge badge-gold" style={{ marginBottom: "1.25rem", display: "inline-block" }}>{post.category}</span>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1.25, marginBottom: "1.5rem" }}>{post.title}</h1>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              <User size={14} color="var(--gold-primary)" />
              <strong style={{ color: "var(--navy-deep)" }}>{post.author}</strong>
              {post.authorRole && <span style={{ color: "var(--text-muted)" }}>· {post.authorRole}</span>}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.875rem", color: "var(--text-muted)" }}>
              <Clock size={14} /> {post.date} · {post.readTime} read
            </span>
          </div>
          <div className="gold-divider gold-divider-left" />
        </div>
      </section>

      {/* Article Body */}
      <section style={{ paddingTop: "clamp(2rem, 5vw, 3rem)", paddingBottom: "clamp(3rem, 7vw, 5rem)" }}>
        <div className="container" style={{ maxWidth: "760px", margin: "0 auto", padding: "0 1rem" }}>
          {/* Lead */}
          <p style={{ fontSize: "1.1rem", lineHeight: 1.85, fontWeight: 500, color: "var(--navy-mid)", marginBottom: "2rem", borderLeft: "3px solid var(--gold-primary)", paddingLeft: "1.25rem" }}>
            {post.excerpt}
          </p>

          {/* Scripture / Quote */}
          {post.scripture && (
            <div className="scripture-block">
              {post.scripture.text}
              <span className="scripture-reference">— {post.scripture.reference}</span>
            </div>
          )}

          {/* Content */}
          <div style={{ lineHeight: 1.9, color: "var(--text-secondary)" }}>
            {post.content.split("\n\n").map((para, i) => {
              const trimmed = para.trim();
              if (trimmed.startsWith("“") && trimmed.endsWith("”")) {
                return (
                  <div key={i} className="scripture-block" style={{ margin: "2rem 0" }}>
                    <p style={{ fontStyle: "italic", margin: 0 }}>{trimmed}</p>
                  </div>
                );
              }
              if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
                return (
                  <h3 key={i} style={{ fontSize: "1.3rem", color: "var(--navy-deep)", margin: "2.5rem 0 1rem" }}>
                    {trimmed.replace(/\*\*/g, "")}
                  </h3>
                );
              }
              const withBold = trimmed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
              return <p key={i} style={{ marginBottom: "1.5rem" }} dangerouslySetInnerHTML={{ __html: withBold }} />;
            })}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "2.5rem", paddingTop: "2rem", borderTop: "1px solid var(--border-light)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, marginRight: "0.25rem" }}>
                <Tag size={13} /> Tags:
              </span>
              {post.tags.map((tag) => (
                <span key={tag} className="badge badge-gold">{tag}</span>
              ))}
            </div>
          )}

          {/* Author Card */}
          <div style={{ marginTop: "2.5rem", padding: "1.75rem", background: "var(--cream-mid)", borderRadius: "16px", border: "1px solid var(--border-light)", display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg, var(--navy-deep), var(--navy-mid))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "var(--gold-light)", fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "1.1rem" }}>
                {post.author[0]}
              </span>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "var(--navy-deep)", marginBottom: "0.25rem" }}>{post.author}</div>
              <div style={{ fontSize: "0.82rem", color: "var(--gold-dark)", marginBottom: "0.625rem" }}>{post.authorRole} · CWAY Academy</div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                Equipping rural pastors and Christian leaders across India with contextually relevant, world-class theological education.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {related.length > 0 && (
        <section style={{ background: "var(--cream-mid)", paddingTop: "clamp(2.5rem, 6vw, 4rem)", paddingBottom: "clamp(2.5rem, 6vw, 4rem)" }}>
          <div className="container" style={{ maxWidth: "760px", margin: "0 auto", padding: "0 1rem" }}>
            <h3 style={{ marginBottom: "1.5rem", fontFamily: "var(--font-serif)", color: "var(--navy-deep)" }}>Related Articles</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`} style={{ display: "block", textDecoration: "none" }}>
                  <div className="card-cream" style={{ padding: "1.5rem", borderRadius: "12px", background: "white", border: "1px solid var(--border-light)", height: "100%" }}>
                    <span className="badge badge-gold" style={{ marginBottom: "0.75rem", display: "inline-block", fontSize: "0.7rem" }}>{r.category}</span>
                    <h4 style={{ fontSize: "0.95rem", lineHeight: 1.35, color: "var(--navy-deep)", marginBottom: "0.625rem", fontFamily: "var(--font-serif)", fontWeight: 700 }}>{r.title}</h4>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", gap: "0.75rem" }}>
                      <span><User size={10} style={{ verticalAlign: "middle" }} /> {r.author}</span>
                      <span><Clock size={10} style={{ verticalAlign: "middle" }} /> {r.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
              <Link href="/blog" className="btn-primary" style={{ display: "inline-block", textDecoration: "none", backgroundColor: "var(--navy-deep)", color: "white", padding: "0.75rem 2rem", borderRadius: "50px", fontWeight: 600 }}>
                View All Articles
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
