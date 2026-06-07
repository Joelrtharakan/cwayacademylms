"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EmailCard } from "@/components/EmailCard";
import { ContactContent } from "./contact/ContactContent";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/store/auth.store";
import Link from "next/link";

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

Arulappan was a true pioneer and visionary who believed in local training for Christian leaders. He was a local pastor and Christian leader with the vision to train and produce Christian leaders for the future church in India. The impact of his training and the Tirunelveli revival continues to this day, as we have many Pentecostal-Charismatic Christian leaders and churches in South India.
`,
    author: "Dr. Reeju Tharakan",
    authorRole: "M.Th., Ph.D.",
    date: "March 16, 2026",
    readTime: "6 min",
    category: "History",
  },

  {
    slug: "mary-chapmans-resolve",
    title: "“They Will Not Go, I Must” — The Legacy of Mary Chapman",
    excerpt: "Mary Weems Chapman, a 60-year-old veteran missionary, became the first Assemblies of God missionary to India, pioneering children's homes and local leadership training in Kerala.",
    content: `“They will not go, I must” were the words of Mary Weems Chapman, a 60-year-old veteran missionary who, in 1915, became the first Assemblies of God missionary to India. Mary Chapman was a Free Methodist missionary before her association with the Assemblies of God, and she worked in Liberia and India. Between 1890 and 1900, Mary worked in Daund, Pune, Mumbai, and Doddaballapur near Bangalore, and she was heavily involved in the ministry of children’s homes, which provided education and moral support to underprivileged children. After spending some years in India, single and aging, she returned to the United States of America. In 1915, she felt the call of God to return to India as a missionary from the Assemblies of God fellowship. However, her family and friends discouraged her, saying she was too old to go back to India. Nevertheless, she persevered in her resolve and made her decision firm, and she became the first Assemblies of God missionary to India. Before leaving the U.S. for India, she said: "The Spirit of God will not permit me to remain at home in a life of ease while souls are perishing…if young people are not able to go, old people must go."    

Mary Chapman arrived in India in October 1915 and had a vision that women and little girls in South India should lead the people of India to the experience of the new birth, Baptism in the Holy Spirit, divine healing, and baptism by immersion. She earnestly prayed for revival in India. From September 1917, Chapman visited Kerala and conducted meetings in Trivandrum. She raised a team of local leaders in Kerala, including Manessah, Mathew, Jaborathanam Daniel, and Jacob; later, they served as leaders of the Assemblies of God mission in South Kerala. She initiated a training center in Kerala for indigenous leaders. It later grew into a full-fledged Bible School. She envisioned the training and development of local church leaders in India. In the twentieth century, this training of local leaders impacted the development of many Pentecostal-Charismatic leaders in India. Training leaders for the local church has been a vision for many Christian institutions and organizations.

John Maxwell made the leadership statement, “Everything rises and falls on leadership.” This statement has become especially significant in today’s church context in India, where there appears to be a shortage of trained pastors and local leaders. Because of India’s many ethnic groups and languages, training Christian leaders has become the most challenging task for churches and theological institutions. There are thousands of untrained pastors and lay leaders in remote villages in India who have never had the opportunity for formal leadership training or theological education. The poor financial status of churches and families, along with the lack of training programs in local languages, always hinders local pastors and leaders from enrolling in theological education or Christian leadership programs. What can we do for them?
`,
    author: "Dr. Reeju Tharakan",
    authorRole: "M.Th., Ph.D.",
    date: "April 28, 2026",
    readTime: "7 min",
    category: "Missions",
  },
  {
    slug: "obedience-will-of-god-the-garrs",
    title: "Obedience to the Will of God — The Garrs",
    excerpt: "Alfred and Lillian Garr were model missionaries who obeyed God's will to bring the Pentecostal message to India in 1906, sparking a revival across Calcutta, Pune, and Bombay.",
    content: `Growing in the grace and wisdom of God means finding favor with God and obeying His will. The first men and women who experienced baptism in the Holy Spirit at the beginning of the twentieth century were growing in the grace and wisdom of God. Some of them obeyed God's will and became the first Pentecostal missionaries to India.  

Alfred Goodrich Garr of Danville, Kentucky, was passionately seeking a personal encounter with God, which he always told his mother, “I am feeling after God.” In his continued pursuit of God, he traveled to several places, attended many meetings, and later joined Asbury College for ministerial training. Garr married Lillian Anderson, daughter of a Methodist bishop, while at Asbury College. They then moved to California to become pastors of an independent congregation, the Burning Bush Church. Although he was established as a pastor of this church, his desire for a deeper relationship with God continued. During this time, the Azusa Street Revival broke out, and Garr attended every session enthusiastically. On June 14, 1906, Garr received baptism in the Holy Spirit with speaking in tongues. At one meeting, while he was speaking in tongues, a British Indian approached him and said that Garr was speaking his mother tongue, Bengali. Initially, Lillian was skeptical about taking this experience as divine, and Garr asked her to attend one session of the Azusa Street Revival. Mrs. Garr received the power of the Holy Spirit with the gift of tongues, Tibetan and Chinese, in her first meeting at the Azusa mission. One week later, Garr stood up in one of the sessions of the Azusa Revival and said, “Friends, I believe that God wants me to go to India with this message.” 

A. G. Garr and Lillian Garr, with their daughter Virginia and their assistant Maria Gardner, arrived in Calcutta in December 1906. For the first three weeks, this missionary couple prayed for an opening to begin their ministry. During this time, Garr realized that he could not use the ‘Bengali’ language he had received as a gift of tongues at the Azusa Street Revival for preaching in Calcutta. However, he was not discouraged; instead, he studied the scriptures and came to understand that speaking in tongues was a source of spiritual empowerment rather than a tool for missionary evangelism. They were then invited to attend a prayer meeting of missionaries at the Woman’s Union Missionary Society mission house on Dhurmutulla Street to share about ‘God’s visitation in America.’ The missionaries who attended this meeting received the baptism of the Spirit. Later, Garr met Pastor Hook of the Bow Bazar Baptist Church – the church William Carey had ministered to 100 years earlier. The Garrs conducted revival meetings at this church with Pastor Hook. Some Protestant missionaries and local Christians experienced the power of the Holy Spirit.  

Lillian Garr reported on this revival in the periodical Apostolic Faith of the Azusa Street Mission: “God is spreading Pentecost in Calcutta, … We are among the Bible teachers, and they have the Word so stored away; but now the Spirit is putting life and power into it, which is wonderful to behold.” One night in Calcutta, Sister Lillian Garr had a vision of Jesus, His hands filled with golden crowns ready to place on heads. She realized that God had put a burden on her heart for the hungry souls in India. The Garrs began praying for missionaries in India to receive the outpouring of the Holy Spirit. She initiated revival prayer meetings among the missionary ladies in Calcutta. Miss Susan Easton, head of the American Women’s Board of Missions, and Fanny Simpson, a Methodist missionary and director of a girls’ orphanage, received the Holy Spirit's empowerment in these meetings. At Miss Simpson's orphanage, forty-five native girls prayed and received the Spirit’s baptism. These girls became local ministers and witnessed the power of the gospel in their families and villages. The revival continued to spread in Calcutta, Pune, and Bombay. The Garrs visited and conducted revival meetings at Ramabai’s Mukti Sadan in Pune and at a boys’ home in Dhond. The Garrs family went from Calcutta to Sri Lanka, then to Hong Kong and China. Despite personal tragedy, including the deaths of their two daughters and their assistant Maria, they continued the work of the Lord in China until 1911.

Alfred and Lillian Garr were a model missionary family who had grown in the grace and wisdom of God. They obeyed God's will in their lives and accepted their challenging experiences as God-given for the glory of God. The impact of their lives and ministry will endure forever. 

`,
    author: "Dr. Reeju Tharakan",
    authorRole: "M.Th., Ph.D.",
    date: "May 15, 2026",
    readTime: "8 min",
    category: "History",
  }
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedBlogPost, setSelectedBlogPost] = useState<Post | null>(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["publicCourses"],
    queryFn: () => api.get("/courses").then((res) => res.data.data),
  });
  const courses = coursesData?.courses || [];

  useEffect(() => {
    if (selectedBlogPost || showPrivacyModal || showTermsModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedBlogPost, showPrivacyModal, showTermsModal]);

  useEffect(() => {
    // 1. Router System
    const navigateTo = () => {
      const hash = window.location.hash || "#home";
      const id = hash.replace("#", "");
      setActiveTab(id);
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Trigger reveal animations after render
      setTimeout(() => initRevealAnimations(id), 100);
    };

    navigateTo();
    window.addEventListener("hashchange", navigateTo);

    // 2. Scroll Progress & Navbar styling
    const handleScroll = () => {
      const progressEl = document.getElementById("progress");
      if (progressEl) {
        const docHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        const pct = (window.scrollY / (docHeight - window.innerHeight)) * 100;
        progressEl.style.width = pct + "%";
      }

      const navEl = document.querySelector("nav");
      if (navEl) {
        if (window.scrollY > 50) {
          navEl.style.boxShadow = "0 4px 30px rgba(0, 0, 0, 0.06)";
          navEl.style.height = "70px";
        } else {
          navEl.style.boxShadow = "none";
          navEl.style.height = "80px";
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("hashchange", navigateTo);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Reveal Animations Observer
  const initRevealAnimations = (tabId?: string) => {
    const currentTab = tabId || activeTab;
    const els = document.querySelectorAll(`#${currentTab} .reveal`);
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          obs.unobserve(e.target);

          if (e.target.classList.contains("stat-item") && !e.target.getAttribute("data-counted")) {
            animateCounter(e.target.querySelector(".counter") as HTMLElement);
            e.target.setAttribute("data-counted", "true");
          }
        }
      });
    }, { threshold: 0.1 });

    els.forEach((el) => {
      el.classList.remove("in");
      obs.observe(el);
    });
  };

  // Stats Counter Animation
  const animateCounter = (el: HTMLElement | null) => {
    if (!el) return;
    const target = +(el.getAttribute("data-target") || 0);
    const duration = 2000;
    const startTime = performance.now();

    function update(time: number) {
      const progress = Math.min((time - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(easeProgress * target);

      if (el) {
        el.innerText = String(current);
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.innerText = String(target);
        }
      }
    }
    requestAnimationFrame(update);
  };

  const getPageStyle = (tabId: string) => {
    const isActive = activeTab === tabId;
    return {
      display: isActive ? "block" : "none",
      opacity: isActive ? 1 : 0,
      transition: "opacity 0.4s ease"
    };
  };

  return (
    <>
      {/* Scope HTML styles strictly to page */}
      <style dangerouslySetInnerHTML={{
        __html: `
        /* Color Palette - Forest & Sunlit Wood */
        :root {
            --bg-main: #FAFAF7;
            --bg-alt: #F3F4F0;
            --bg-soft: #EAECE4;
            --accent-green: #2C4A3B;
            --accent-green-light: #4A7A62;
            --accent-gold: #B88645;
            --accent-gold-light: #D4A35B;
            --text-main: #1A261D;
            --text-muted: #5A6B60;
            --border: #DCE0D5;
            --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.03);
            --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.06), 0 4px 8px rgba(0, 0, 0, 0.03);
            --shadow-lg: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.04);
            --shadow-xl: 0 24px 48px rgba(0, 0, 0, 0.12), 0 12px 24px rgba(0, 0, 0, 0.06);
            --radius-md: 16px;
            --radius-lg: 24px;
        }

        /* Reset styles */
        body { 
            font-family: var(--font-plus-jakarta), sans-serif !important; 
            background: var(--bg-main) !important; 
            color: var(--text-main) !important;
            padding-top: 80px !important; 
            overflow-x: hidden !important;
            line-height: 1.7 !important;
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
        }

        .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
        .section { padding-top: 7rem; padding-bottom: 7rem; }
        .text-center { text-align: center; }

        /* Typography */
        h1, h2, h3, h4, h5, h6 { font-family: var(--font-dm-serif), serif !important; color: var(--text-main); line-height: 1.15; }
        .headline-hero { font-weight: 400; font-size: clamp(42px, 6vw, 78px); line-height: 1.08; margin-bottom: 1.5rem; color: #FFFFFF; letter-spacing: -0.02em; }
        .headline-page { font-weight: 400; font-size: clamp(34px, 4.5vw, 58px); margin-bottom: 1rem; letter-spacing: -0.01em; }
        .heading-section { font-weight: 400; font-size: clamp(26px, 3.5vw, 44px); margin-bottom: 1rem; letter-spacing: -0.01em; }
        .sub-heading { font-family: var(--font-dm-serif), serif !important; font-style: italic; font-weight: 400; font-size: clamp(17px, 2vw, 22px); color: var(--text-muted); }
        .body-text { font-family: var(--font-plus-jakarta), sans-serif !important; font-size: 15.5px; color: var(--text-muted); line-height: 1.75; font-weight: 400; }
        .label { font-family: var(--font-plus-jakarta), sans-serif !important; font-size: 12px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: var(--accent-green); margin-bottom: 0.75rem; display: block; }

        /* Buttons */
        .btn-primary {
            background: var(--accent-green); color: #FFFFFF; border: 2px solid var(--accent-green);
            font-family: var(--font-plus-jakarta), sans-serif; font-weight: 700; font-size: 13px; padding: 15px 36px; border-radius: 50px;
            display: inline-block; text-align: center; box-shadow: var(--shadow-md);
            transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); letter-spacing: 1.5px; text-transform: uppercase;
        }
        .btn-primary:hover { background: transparent; color: var(--accent-green); box-shadow: none; transform: translateY(-3px); }
        
        .btn-secondary {
            background: transparent; color: var(--accent-gold); border: 2px solid var(--accent-gold);
            font-family: var(--font-plus-jakarta), sans-serif; font-weight: 700; font-size: 13px; padding: 15px 36px; border-radius: 50px;
            display: inline-block; text-align: center; transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); letter-spacing: 1.5px; text-transform: uppercase;
        }
        .btn-secondary:hover { background: var(--accent-gold); color: #FFFFFF; box-shadow: var(--shadow-md); transform: translateY(-3px); }

        /* Navigation */
        nav {
            position: fixed; top: 0; left: 0; width: 100%; height: 80px;
            background: rgba(250, 250, 247, 0.92); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid rgba(220, 224, 213, 0.6); z-index: 1000;
            display: flex; align-items: center; justify-content: space-between;
            padding: 0 5%; transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-brand { display: flex; align-items: center; gap: 1rem;}
        .nav-logo-text { 
            font-family: var(--font-cinzel), 'Cinzel', Georgia, serif !important;
            font-size: 21px;
            font-weight: 700;
            letter-spacing: 3px;
            color: var(--text-main);
            text-transform: uppercase;
            line-height: 1;
        }
        .nav-logo-text .logo-cway {
            color: var(--text-main);
        }
        .nav-logo-text .logo-academy {
            color: var(--accent-gold);
            font-weight: 400;
            letter-spacing: 4px;
        }
        
        .nav-links { display: flex; gap: 2.5rem; align-items: center; }
        .nav-links a {
            font-family: var(--font-plus-jakarta), sans-serif; font-size: 12.5px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
            color: var(--text-muted); position: relative; padding: 0.5rem 0;
            transition: all 0.35s ease;
        }
        .nav-links a:hover { color: var(--accent-green); }
        .nav-links a::after {
            content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 0; height: 2px;
            background: var(--accent-green); transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-links a:hover::after, .nav-links a.nav-active::after { width: 100%; }
        .nav-links a.nav-active { color: var(--accent-green); }
        
        .hamburger { display: none; flex-direction: column; cursor: pointer; gap: 6px; }
        .hamburger span { width: 24px; height: 2px; background: var(--text-main); transition: 0.3s; border-radius: 2px; }

        .mobile-overlay {
            background: var(--bg-main); position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
            z-index: 999; transform: translateY(-100%); transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            gap: 2.5rem;
        }
        .mobile-overlay.open { transform: translateY(0); }
        .mobile-overlay-close { position: absolute; top: 30px; right: 5%; font-size: 32px; color: var(--text-main); cursor: pointer; }
        .mobile-overlay a {
            font-family: var(--font-dm-serif), serif; font-size: 30px; font-weight: 400; color: var(--text-main);
            text-align: center; transition: all 0.3s ease;
        }
        .mobile-overlay a:hover { color: var(--accent-green); }

        /* Progress Bar */
        #progress { position: fixed; top: 0; left: 0; height: 3px; width: 0%; background: linear-gradient(to right, var(--accent-green-light), var(--accent-gold)); z-index: 1001; transition: width 0.1s linear; }

        /* Reveal Animations */
        .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1); }
        .reveal.in { opacity: 1; transform: translateY(0); }
        .stagger-1 { transition-delay: 0.12s; } .stagger-2 { transition-delay: 0.24s; } .stagger-3 { transition-delay: 0.36s; }

        @keyframes fadeUpHero {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .reveal-hero {
          animation: fadeUpHero 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        /* Hero */
        .hero-section { 
            min-height: calc(100vh - 80px); 
            position: relative; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            text-align: center; 
            background: linear-gradient(160deg, rgba(44, 74, 59, 0.7), rgba(26, 38, 29, 0.88)), url('https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=60') center/cover no-repeat;
            background-attachment: fixed;
            overflow: hidden; 
            padding: 4rem 2rem; 
        }
        .hero-content { position: relative; z-index: 1; max-width: 860px; margin: 0 auto; }
        .hero-btn-group { display: flex; gap: 1.5rem; justify-content: center; margin-top: 3rem; flex-wrap: wrap; }

        .hero-content .body-text { color: rgba(255,255,255,0.85); font-size: 18px; }
        .hero-content .btn-primary { background: var(--accent-gold); border-color: var(--accent-gold); color: white; }
        .hero-content .btn-primary:hover { background: transparent; color: var(--accent-gold); }
        .hero-content .btn-secondary { background: transparent; border-color: rgba(255,255,255,0.6); color: white; }
        .hero-content .btn-secondary:hover { background: white; color: var(--accent-green); border-color: white; }

        /* Cards */
        .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 3rem; align-items: center; }
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
        .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; }

        .card { 
            background: #FFFFFF; 
            border-radius: var(--radius-lg); 
            padding: 2.5rem 2rem; 
            box-shadow: var(--shadow-sm); 
            border: 1px solid rgba(220, 224, 213, 0.5); 
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
            position: relative;
            overflow: hidden;
        }
        .card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--accent-green), var(--accent-gold-light));
            opacity: 0;
            transition: opacity 0.4s ease;
        }
        .card:hover { 
            transform: translateY(-6px); 
            box-shadow: var(--shadow-lg); 
            border-color: transparent; 
        }
        .card:hover::before { opacity: 1; }
        
        .card-accent-bar {
            width: 40px; height: 3px; border-radius: 2px;
            background: linear-gradient(90deg, var(--accent-green), var(--accent-green-light));
            margin-bottom: 1.5rem;
        }

        /* Stats */
        .stats-section { background: var(--accent-green); color: white; padding-top: 5rem; padding-bottom: 5rem; position: relative; overflow: hidden; }
        .stats-section::before {
            content: '';
            position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(circle at 20% 50%, rgba(74, 122, 98, 0.3), transparent 50%),
                        radial-gradient(circle at 80% 50%, rgba(184, 134, 69, 0.15), transparent 50%);
        }
        .stat-item { text-align: center; position: relative; z-index: 1; }
        .stat-num { font-family: var(--font-dm-serif), serif !important; font-size: 3.5rem; font-weight: 400; margin-bottom: 0.5rem; color: white; }
        .stat-label { font-family: var(--font-plus-jakarta), sans-serif !important; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,0.7); }

        /* Page Headers */
        .page-header { background: var(--bg-alt); padding-top: 6rem; padding-bottom: 4rem; text-align: center; border-bottom: 1px solid var(--border); }
        .page-header p { max-width: 700px; margin: 0 auto; }

        /* About challenge box & quotes */
        .challenge-box { background: #FFFFFF; padding: 2rem; border-radius: var(--radius-md); margin-bottom: 1.25rem; border-left: 3px solid var(--accent-green); text-align: left; box-shadow: var(--shadow-sm); transition: all 0.3s ease; }
        .challenge-box:hover { box-shadow: var(--shadow-md); transform: translateX(4px); }
        .quote-text { font-family: var(--font-dm-serif), serif !important; font-size: 22px; font-style: italic; color: var(--accent-green); line-height: 1.5; border-left: 3px solid var(--accent-gold); padding-left: 2rem; margin: 3rem 0; text-align: left; }

        /* Badges */
        .course-card { display: flex; flex-direction: column; justify-content: space-between; height: 100%; text-align: left; }
        .course-badges { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
        .badge { background: var(--bg-soft); color: var(--accent-green); font-family: var(--font-plus-jakarta), sans-serif; font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }

        /* Team placeholder */
        .team-card { text-align: center; }
        .team-img-placeholder { 
            width: 110px; height: 110px; 
            background: linear-gradient(135deg, var(--accent-green), var(--accent-green-light)); 
            border-radius: 50%; margin: 0 auto 1.5rem; 
            display: flex; align-items: center; justify-content: center; 
            font-family: var(--font-dm-serif), serif !important; font-size: 32px; font-weight: 400; 
            color: white; 
            box-shadow: 0 8px 24px rgba(44, 74, 59, 0.25);
            transition: all 0.4s ease;
        }
        .team-card:hover .team-img-placeholder { transform: scale(1.05); box-shadow: 0 12px 32px rgba(44, 74, 59, 0.3); }

        /* Partnership list & bank details */
        .partner-list { list-style: none; counter-reset: partner-counter; text-align: left; }
        .partner-list li { position: relative; padding-left: 4rem; margin-bottom: 2rem; font-size: 16px; color: var(--text-muted); line-height: 1.7; }
        .partner-list li::before { counter-increment: partner-counter; content: "0" counter(partner-counter); position: absolute; left: 0; top: -4px; font-family: var(--font-dm-serif), serif; font-size: 26px; font-weight: 400; color: var(--accent-gold-light); }
        .bank-card { background: #FFFFFF; padding: 3rem; border-radius: var(--radius-lg); text-align: center; border: 1px dashed var(--accent-green); box-shadow: var(--shadow-sm); }

        /* Blog details */
        .blog-card { overflow: hidden; padding: 0; text-align: left; transition: all 0.3s ease; }
        .blog-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-lg) !important; border-color: var(--accent-gold) !important; }
        .blog-content { padding: 2.5rem 2.5rem; }
        .blog-label-bar { width: 32px; height: 3px; border-radius: 2px; background: var(--accent-gold); margin-bottom: 1rem; }
        .blog-read { font-family: var(--font-plus-jakarta), sans-serif; font-weight: 700; color: var(--accent-green); display: inline-flex; align-items: center; gap: 8px; margin-top: 1.5rem; text-transform: uppercase; font-size: 12px; letter-spacing: 1.5px; cursor: pointer; transition: all 0.3s ease; }
        .blog-read:hover { color: var(--accent-gold); gap: 14px; }
        .hover-close:hover { background: var(--bg-soft); color: var(--text-main) !important; }
        .hover-btn-close:hover { background: var(--bg-soft); color: var(--text-main) !important; }

        /* Footer */
        footer { background: var(--bg-alt); padding: 5rem 0 2rem; border-top: 1px solid var(--border); text-align: left; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 4rem; }
        .footer-bottom { border-top: 1px solid var(--border); text-align: center; padding-top: 2rem; margin-top: 4rem; color: var(--text-muted); font-size: 13px; }

        /* Vision/Mission Cards special */
        .vm-card { text-align: center; }
        .vm-card-number { 
            font-family: var(--font-dm-serif), serif !important; 
            font-size: 48px; 
            font-weight: 400; 
            color: var(--bg-soft); 
            line-height: 1; 
            margin-bottom: 1rem;
            background: linear-gradient(180deg, var(--accent-green), var(--accent-green-light));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            opacity: 0.2;
        }

        /* Premium About Page Styles */
        .about-header-wrapper {
            background: linear-gradient(135deg, #1A261D 0%, #2C4A3B 100%);
            color: #FFFFFF;
            padding-top: 8rem; padding-bottom: 6rem;
            position: relative;
            overflow: hidden;
        }
        .about-header-wrapper::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(circle at 80% 20%, rgba(184, 134, 69, 0.25), transparent 50%),
                        radial-gradient(circle at 10% 80%, rgba(74, 122, 98, 0.3), transparent 60%);
            pointer-events: none;
        }
        .about-header-grid {
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            gap: 4rem;
            align-items: center;
        }
        .about-header-quote {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border-left: 3px solid var(--accent-gold);
            padding: 2rem;
            border-radius: 0 var(--radius-md) var(--radius-md) 0;
            font-family: var(--font-dm-serif), serif;
            font-style: italic;
            font-size: 1.15rem;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.9);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            border-top: 1px solid rgba(255,255,255,0.08);
            border-right: 1px solid rgba(255,255,255,0.08);
            border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        
        .challenge-section {
            padding-top: 8rem; padding-bottom: 8rem;
            background: var(--bg-main);
        }
        .challenge-new-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 5rem;
            align-items: start;
        }
        .challenge-left-content {
            position: sticky;
            top: 120px;
            text-align: left;
        }
        .challenge-quote-card {
            background: linear-gradient(135deg, var(--accent-green) 0%, #1A261D 100%);
            color: #FFFFFF;
            padding: 3.5rem 3rem;
            border-radius: var(--radius-lg);
            border-left: 4px solid var(--accent-gold);
            box-shadow: var(--shadow-lg);
            position: relative;
            overflow: hidden;
            text-align: left;
            margin-top: 2.5rem;
        }
        .challenge-quote-card::before {
            content: '“';
            position: absolute;
            top: -20px;
            left: 20px;
            font-size: 12rem;
            font-family: var(--font-dm-serif), serif;
            color: rgba(255, 255, 255, 0.05);
            line-height: 1;
            pointer-events: none;
            user-select: none;
        }
        .challenge-list-container {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }
        .challenge-list-item {
            display: flex;
            gap: 2rem;
            padding: 2.5rem 1.5rem;
            border-bottom: 1px solid var(--border);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            background: transparent;
            text-align: left;
        }
        .challenge-list-item:first-child {
            border-top: 1px solid var(--border);
        }
        .challenge-list-number {
            font-family: var(--font-dm-serif), serif !important;
            font-size: 2.8rem;
            line-height: 1;
            font-weight: 400;
            color: var(--accent-gold);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .challenge-list-content {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        .challenge-list-title {
            font-size: 1.3rem;
            font-weight: 700;
            color: var(--accent-green);
            margin: 0;
            transition: color 0.35s ease;
        }
        .challenge-list-item:hover {
            background: rgba(44, 74, 59, 0.03);
            padding-left: 2.5rem;
            padding-right: 1rem;
            border-radius: var(--radius-md);
            border-bottom-color: transparent;
        }
        .challenge-list-item:hover + .challenge-list-item {
            border-top-color: transparent;
        }
        .challenge-list-item:hover .challenge-list-number {
            color: var(--accent-green);
            transform: scale(1.1) translateX(4px);
        }
        .challenge-list-item:hover .challenge-list-title {
            color: var(--accent-gold-light);
        }

        .vm-section {
            padding-top: 8rem; padding-bottom: 8rem;
            background: var(--bg-alt);
            position: relative;
            overflow: hidden;
        }
        .vm-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            max-width: 1100px;
            margin: 0 auto;
        }
        .vm-card-green {
            background: linear-gradient(135deg, var(--accent-green) 0%, #1A261D 100%);
            color: #FFFFFF;
            padding: 4rem 3.5rem;
            border-radius: var(--radius-lg);
            position: relative;
            overflow: hidden;
            box-shadow: var(--shadow-lg);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            text-align: left;
        }
        .vm-card-gold {
            background: linear-gradient(135deg, var(--accent-gold) 0%, #8A6432 100%);
            color: #FFFFFF;
            padding: 4rem 3.5rem;
            border-radius: var(--radius-lg);
            position: relative;
            overflow: hidden;
            box-shadow: var(--shadow-lg);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            text-align: left;
        }
        .vm-card-green:hover, .vm-card-gold:hover {
            transform: translateY(-8px);
            box-shadow: var(--shadow-xl);
        }
        .vm-letter {
            position: absolute;
            bottom: -20px;
            right: -10px;
            font-size: 10rem;
            font-family: var(--font-dm-serif), serif;
            font-weight: 700;
            opacity: 0.08;
            user-select: none;
            pointer-events: none;
            line-height: 1;
        }
        .vm-header {
            font-family: var(--font-dm-serif), serif !important;
            font-size: 2.2rem !important;
            color: #FFFFFF !important;
            margin-bottom: 1.5rem;
            position: relative;
            z-index: 1;
        }
        .vm-text {
            color: rgba(255, 255, 255, 0.85) !important;
            font-size: 1.05rem !important;
            line-height: 1.8 !important;
            position: relative;
            z-index: 1;
        }

        .team-section {
            padding-top: 8rem; padding-bottom: 8rem;
            background: var(--bg-main);
        }
        .team-list-container {
            display: flex;
            flex-direction: column;
            gap: 2.5rem;
            margin-top: 4rem;
            max-width: 1000px;
            margin-left: auto;
            margin-right: auto;
        }
        .modern-team-row-card {
            background: #FFFFFF;
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            padding: 2.5rem;
            box-shadow: var(--shadow-sm);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            display: grid;
            grid-template-columns: 220px 1fr;
            gap: 2.5rem;
            align-items: center;
            text-align: left;
        }
        .modern-team-row-card:hover {
            transform: translateY(-6px);
            box-shadow: var(--shadow-xl);
            border-color: var(--accent-gold-light);
        }
        .team-avatar-container {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            margin-bottom: 1rem;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, var(--accent-green) 0%, var(--accent-green-light) 100%);
            box-shadow: 0 6px 20px rgba(44, 74, 59, 0.15);
            transition: all 0.4s ease;
        }
        .team-avatar-container::after {
            content: '';
            position: absolute;
            top: -6px; left: -6px; right: -6px; bottom: -6px;
            border-radius: 50%;
            border: 2px dashed var(--accent-gold);
            opacity: 0.5;
            transition: all 0.4s ease;
        }
        .modern-team-row-card:hover .team-avatar-container {
            transform: scale(1.05) rotate(5deg);
            box-shadow: 0 10px 30px rgba(44, 74, 59, 0.3);
        }
        .modern-team-row-card:hover .team-avatar-container::after {
            transform: rotate(-15deg);
            opacity: 1;
            border-color: var(--accent-gold-light);
        }
        .team-initials {
            font-family: var(--font-dm-serif), serif !important;
            font-size: 1.8rem;
            color: #FFFFFF;
            font-weight: 400;
        }
        .team-role {
            color: var(--accent-gold);
            font-family: var(--font-plus-jakarta), sans-serif !important;
            font-weight: 700;
            font-size: 0.75rem;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin: 0.5rem 0 1rem;
            line-height: 1.3;
        }
        .team-credential-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background-color: #F3F4F0;
            color: var(--accent-green);
            font-size: 0.75rem;
            font-weight: 600;
            border-radius: 50px;
        }
        .team-row-left {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            border-bottom: 1px solid var(--border);
            padding-bottom: 1.5rem;
            width: 100%;
        }
        .team-row-right {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
        .team-separator {
            width: 48px;
            height: 2px;
            background-color: var(--accent-gold-light);
            margin-bottom: 1rem;
            margin-left: auto;
            margin-right: auto;
        }
        @media (min-width: 993px) {
            .team-row-left {
                align-items: flex-start;
                text-align: left;
                border-bottom: none;
                border-right: 1px solid var(--border);
                padding-bottom: 0;
                padding-right: 2.5rem;
            }
            .team-row-right {
                align-items: flex-start;
                text-align: left;
                padding-left: 2rem;
            }
            .team-separator {
                margin-left: 0;
                margin-right: 0;
            }
        }

        /* Offer section styles */
        .offer-section-grid {
            display: grid;
            grid-template-columns: 1fr 1.6fr;
            gap: 5rem;
            align-items: start;
        }
        .offer-left-column {
            position: sticky;
            top: 120px;
            text-align: left;
        }
        .offer-checklist {
            list-style: none;
            padding: 0;
            margin: 2.5rem 0;
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
        }
        .offer-checklist-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: var(--text-main);
            font-size: 15.5px;
            font-weight: 500;
        }
        .offer-checklist-icon {
            color: var(--accent-green);
            flex-shrink: 0;
        }
        .offer-right-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }
        .offer-card {
            background: linear-gradient(135deg, #FFFFFF 0%, #FAFBF9 100%);
            border: 1px solid rgba(44, 74, 59, 0.08);
            border-radius: var(--radius-lg);
            padding: 3rem 2.2rem;
            box-shadow: var(--shadow-sm);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            text-align: left;
        }
        .offer-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--accent-green), var(--accent-gold));
            opacity: 0;
            transition: opacity 0.4s ease;
        }
        .offer-card:hover {
            transform: translateY(-6px);
            box-shadow: var(--shadow-xl);
            border-color: rgba(44, 74, 59, 0.15);
        }
        .offer-card:hover::before {
            opacity: 1;
        }
        .offer-icon-circle {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            border: 1px dashed transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            transition: all 0.5s ease;
        }
        .offer-icon-inner {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: rgba(44, 74, 59, 0.06);
            color: var(--accent-green);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.4s ease;
        }
        .offer-card:hover .offer-icon-circle {
            border-color: var(--accent-gold);
            transform: rotate(15deg);
        }
        .offer-card:hover .offer-icon-inner {
            background: var(--accent-green);
            color: #FFFFFF;
            transform: scale(1.05);
            box-shadow: 0 6px 16px rgba(44, 74, 59, 0.25);
        }
        .offer-card-arrow {
            margin-top: auto;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--accent-green);
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            opacity: 0.6;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .offer-card:hover .offer-card-arrow {
            opacity: 1;
            color: var(--accent-gold);
        }
        .offer-card-arrow svg {
            transition: transform 0.3s ease;
        }
        .offer-card:hover .offer-card-arrow svg {
            transform: translateX(4px);
        }

        /* Responsive Layouts */
        @media (max-width: 992px) {
            .grid-4, .grid-3 { grid-template-columns: repeat(2, 1fr); }
            .grid-2 { grid-template-columns: 1fr; }
            .about-header-grid { grid-template-columns: 1fr; gap: 2.5rem; }
            .challenge-grid { grid-template-columns: 1fr; gap: 2rem; }
            .vm-grid { grid-template-columns: 1fr; gap: 2.5rem; }
            .modern-team-row-card { grid-template-columns: 1fr; gap: 1.5rem; }
            .team-list-container { gap: 2rem; }
            .offer-section-grid { grid-template-columns: 1fr; gap: 3rem; }
            .offer-left-column { position: relative; top: 0; }
            .challenge-new-grid { grid-template-columns: 1fr; gap: 3.5rem; }
            .challenge-left-content { position: relative; top: 0; }
            .offer-right-grid { grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
            .what-we-offer-grid { grid-template-columns: repeat(2, 1fr) !important; }
            .hero-section { background-attachment: scroll !important; }
        }
        @media (max-width: 768px) {
            .nav-links { display: none; }
            .hamburger { display: flex; }
            .hero-btn-group { flex-direction: column; align-items: stretch; }
            .grid-4, .grid-3, .grid-2 { grid-template-columns: 1fr; }
            .footer-grid { grid-template-columns: 1fr; text-align: center; }
            .stats-section .grid-4 { grid-template-columns: repeat(2, 1fr); gap: 2rem; }
            .section { padding-top: 4rem; padding-bottom: 4rem; }
            .page-header { padding-top: 3rem; padding-bottom: 2rem; }
            .headline-page { font-size: clamp(32px, 9vw, 52px); }
            .offer-right-grid { grid-template-columns: 1fr !important; gap: 1.25rem; }
            .what-we-offer-grid { grid-template-columns: 1fr !important; }
            /* Team row card */
            .modern-team-row-card { grid-template-columns: 1fr; gap: 1.25rem; }
            .team-row-right { padding-left: 0 !important; text-align: left; }
            /* About challenge grid */
            .challenge-new-grid { grid-template-columns: 1fr; }
            /* Nav logo reduce */
            .nav-logo-text { font-size: 17px !important; letter-spacing: 2px !important; }
            /* Stat bar on blog/courses pages */
            .stats-bar-4col { grid-template-columns: repeat(2, 1fr) !important; }
            /* Hero section padding */
            .hero-section { padding: 3rem 1.25rem 2rem; }
            /* Blog reader modal — full screen */
            .blog-modal-panel { max-width: 100vw !important; max-height: 100vh !important; border-radius: 0 !important; margin: 0 !important; }
            .blog-modal-overlay { padding: 0 !important; }
            /* Blog cards */
            .blog-cards-2col { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
            .offer-right-grid { grid-template-columns: 1fr; gap: 1.25rem; }
            .what-we-offer-grid { grid-template-columns: 1fr !important; }
            .hero-stat-row { flex-direction: column; gap: 1rem; }
            .container { padding: 0 1rem; }
        }
        @media (max-width: 480px) {
            .nav-logo-text { font-size: 15px !important; letter-spacing: 1.5px !important; }
            .headline-hero { font-size: clamp(32px, 9vw, 48px); }
            .headline-page { font-size: clamp(28px, 8vw, 40px); }
            .section { padding-top: 3rem; padding-bottom: 3rem; }
            .page-header { padding: 2.5rem 0 1.5rem; }
            .blog-modal-panel { border-radius: 0 !important; }
        }
        @media (max-width: 380px) {
            .nav-logo-text { font-size: 14px !important; letter-spacing: 1px !important; }
            .container { padding: 0 0.75rem; }
        }
      ` }} />

      {/* Progress Scrollbar */}
      <div id="progress"></div>

      {/* Header Navigation */}
      <nav>
        <div className="nav-brand">
          <img 
            src="/logo.png?v=3" 
            alt="CWAY Academy Logo" 
            style={{ width: "48px", height: "48px", objectFit: "contain", flexShrink: 0 }}
          />
          <div className="nav-logo-text"><span className="logo-cway">CWAY</span><span className="logo-academy"> ACADEMY</span></div>
        </div>
        <div className="nav-links">
          <a href="#home" className={activeTab === "home" ? "nav-active" : ""}>Home</a>
          <a href="#about" className={activeTab === "about" ? "nav-active" : ""}>About</a>
          <a href="#courses" className={activeTab === "courses" ? "nav-active" : ""}>Courses</a>
          <a href="#involved" className={activeTab === "involved" ? "nav-active" : ""}>Get Involved</a>
          <a href="#blog" className={activeTab === "blog" ? "nav-active" : ""}>Blog</a>
          <a href="#contact" className={activeTab === "contact" ? "nav-active" : ""}>Contact</a>
        </div>
        <div className="hamburger" onClick={() => setMobileMenuOpen(true)}>
          <span></span><span></span><span></span>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-overlay ${mobileMenuOpen ? "open" : ""}`} id="mobile-overlay">
        <div className="mobile-overlay-close" onClick={() => setMobileMenuOpen(false)}>×</div>
        <a href="#home" className={activeTab === "home" ? "nav-active" : ""} onClick={() => setMobileMenuOpen(false)}>Home</a>
        <a href="#about" className={activeTab === "about" ? "nav-active" : ""} onClick={() => setMobileMenuOpen(false)}>About</a>
        <a href="#courses" className={activeTab === "courses" ? "nav-active" : ""} onClick={() => setMobileMenuOpen(false)}>Courses</a>
        <a href="#involved" className={activeTab === "involved" ? "nav-active" : ""} onClick={() => setMobileMenuOpen(false)}>Get Involved</a>
        <a href="#blog" className={activeTab === "blog" ? "nav-active" : ""} onClick={() => setMobileMenuOpen(false)}>Blog</a>
        <a href="#contact" className={activeTab === "contact" ? "nav-active" : ""} onClick={() => setMobileMenuOpen(false)}>Contact</a>
      </div>

      {/* ─── HOME PAGE ─── */}
      <section id="home" className="page" style={getPageStyle("home")}>
        <div className="hero-section">
          <div className="hero-content reveal-hero">
            <span className="label" style={{ justifyContent: "center", marginBottom: "1.5rem", color: "var(--accent-gold-light)" }}>Cway Missions Presents</span>
            <h1 className="headline-hero">Coach. Challenge.<br /><span style={{ color: "var(--accent-gold-light)" }}>Commission.</span></h1>
            <p className="body-text" style={{ fontSize: "18px", maxWidth: "580px", margin: "0 auto", color: "rgba(255,255,255,0.85)" }}>Experience the unique blend of coaching, challenging, and commissioning to shape or enhance your leadership potential.</p>
            <div className="hero-btn-group">
              <a href="#about" className="btn-primary">Know More</a>
              <a href="/register" className="btn-secondary">Enroll Now</a>
            </div>
          </div>
        </div>

        {/* ── WHAT WE OFFER ── */}
        <div className="section" style={{ background: "linear-gradient(180deg, #F7F8F4 0%, #EDEEE8 100%)", padding: "clamp(80px, 10vw, 140px) 0" }}>
          <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
            {/* Section Header — centered */}
            <div className="reveal" style={{ textAlign: "center", marginBottom: "64px" }}>
              <span className="label" style={{ color: "var(--accent-green)", letterSpacing: "3px", fontSize: "11px", fontWeight: 700 }}>What We Offer</span>
              <h2 className="heading-section" style={{ fontSize: "clamp(30px, 4vw, 48px)", lineHeight: 1.15, marginTop: "12px", marginBottom: "20px", color: "var(--accent-green)" }}>
                Train at Your Own Pace and Place
              </h2>
              <p className="body-text" style={{ fontSize: "17px", maxWidth: "620px", margin: "0 auto", color: "#5A6B5D" }}>
                We provide an accessible, comfortable learning environment for anyone interested in theological education alongside their professional commitments.
              </p>
            </div>

            {/* Feature Cards — 2×2 grid */}
            <div className="what-we-offer-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px", marginBottom: "40px" }}>
              {[
                { num: "01", title: "Hybrid Learning", desc: "Online and offline environment for your Christian leadership through systematic, biblical, and accredited training programs." },
                { num: "02", title: "Easy Access", desc: "From the comfort of your own home or location, participate in this training to accomplish God\u0027s vision." },
                { num: "03", title: "Dedicated Coaches", desc: "Courses are designed and taught by qualified educators, missionaries, and pastors with real ministry experience." },
                { num: "04", title: "Global Commission", desc: "Fulfil God\u0027s great commission as a Christian leader, pastor-teacher, worship leader, or counsellor anywhere." }
              ].map((item, i) => (
                <div
                  key={i}
                  className={`reveal ${i > 0 ? `stagger-${Math.min(i, 3)}` : ""}`}
                  style={{
                    background: "#fff",
                    borderRadius: "20px",
                    padding: "44px 36px",
                    border: "1px solid #DCE0D5",
                    position: "relative",
                    overflow: "hidden",
                    transition: "transform 0.4s, box-shadow 0.4s, border-color 0.4s",
                    cursor: "default",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 20px 60px rgba(44,74,59,0.12)"; e.currentTarget.style.borderColor = "var(--accent-gold-light)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#DCE0D5"; }}
                >
                  {/* Number watermark */}
                  <span style={{
                    position: "absolute", top: "-8px", right: "16px",
                    fontSize: "96px", fontWeight: 800, lineHeight: 1,
                    color: "#2C4A3B", opacity: 0.04,
                    fontFamily: "var(--font-serif, Georgia, serif)",
                    pointerEvents: "none", userSelect: "none"
                  }}>{item.num}</span>

                  {/* Gold accent bar */}
                  <div style={{ width: "36px", height: "3px", background: "var(--accent-gold-light)", borderRadius: "2px", marginBottom: "24px" }} />

                  <h3 style={{ fontSize: "20px", fontWeight: 600, color: "var(--accent-green)", marginBottom: "12px", fontFamily: "var(--font-serif, Georgia, serif)" }}>{item.title}</h3>
                  <p className="body-text" style={{ fontSize: "14.5px", lineHeight: 1.65, color: "#5A6B5D" }}>{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Bottom banner row */}
            <div className="reveal courses-banner-row">
              <div className="courses-banner-tags">
                {["Flexible hybrid schedule", "Globally recognized credentials", "Fully bilingual programs"].map((text, i) => (
                  <span key={i} className="courses-banner-tag">{text}</span>
                ))}
              </div>
              <a href="#courses" className="btn-primary" style={{ padding: "14px 32px", fontSize: "12px", textAlign: "center" }}>Explore Courses</a>
            </div>
          </div>
        </div>

        <div className="stats-section">
          <div className="container grid-4">
            <div className="stat-item reveal">
              <div className="stat-num counter" data-target="10">0</div>
              <div className="stat-label">Courses</div>
            </div>
            <div className="stat-item reveal stagger-1">
              <div className="stat-num counter" data-target="60">0</div>
              <div className="stat-label">Weeks to Complete</div>
            </div>
            <div className="stat-item reveal stagger-2">
              <div className="stat-num">15</div>
              <div className="stat-label">Months Max Duration</div>
            </div>
            <div className="stat-item reveal stagger-3">
              <div className="stat-num">∞</div>
              <div className="stat-label">Global Reach</div>
            </div>
          </div>
        </div>

        <div className="section" style={{ background: "var(--bg-alt)" }}>
          <div className="container text-center reveal">
            <span className="label text-center">Take the Next Step</span>
            <h2 className="heading-section">Is it too late for you to be equipped for God&apos;s calling?</h2>
            <p className="sub-heading" style={{ marginBottom: "3rem" }}>&ldquo;Keep your hope alive. The Lord has already prepared a path for you.&rdquo;</p>
            <a href="#contact" className="btn-primary">Get in Touch</a>
          </div>
        </div>
      </section>

      {/* ─── ABOUT PAGE ─── */}
      <section id="about" className="page" style={getPageStyle("about")}>
        {/* About Header */}
        <div className="about-header-wrapper">
          <div className="container about-header-grid reveal">
            <div>
              <span className="label" style={{ color: "var(--accent-gold-light)", marginBottom: "1rem" }}>Who We Are</span>
              <h1 className="headline-page" style={{ color: "#FFFFFF", marginBottom: "1.5rem" }}>About CWAY Academy</h1>
              <p className="body-text" style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "1.1rem", lineHeight: "1.8", maxWidth: "680px" }}>
                CWAY ACADEMY is a Bible-based leadership training project of the religious trust “CWAY MISSIONS,” registered in Bangalore, India. God laid a great vision in our hearts to equip members and pastors of rural churches in India as frontline leaders.
              </p>
            </div>
            <div className="about-header-quote">
              &ldquo;Equipping frontline leaders for God&apos;s Great Commission through accessible, indigenous, and systematic theological training.&rdquo;
            </div>
          </div>
        </div>

        {/* The Challenges Section */}
        <div className="challenge-section">
          <div className="container">
            <div className="challenge-new-grid">
              {/* Left Column: Heading & Quote Card */}
              <div className="challenge-left-content reveal">
                <span className="label">The Challenge We Face</span>
                <h2 className="heading-section" style={{ fontSize: "clamp(28px, 3.5vw, 42px)", lineHeight: "1.2", marginBottom: "1.5rem" }}>
                  A challenge for today’s Indian Church
                </h2>
                <p className="body-text" style={{ fontSize: "16px" }}>
                  India is home to many ethnic groups and languages, making Christian leadership training the most challenging task for churches and theological institutions.
                </p>

                <div className="challenge-quote-card">
                  <p style={{ fontFamily: "var(--font-serif, Georgia, serif)", fontStyle: "italic", fontSize: "18px", lineHeight: 1.7, color: "#FFFFFF" }}>
                    &ldquo;Thousands of untrained pastors and lay leaders in remote villages in India have never had the opportunity for formal leadership training or theological education, leaving them vulnerable to false teachings.&rdquo;
                  </p>
                </div>
              </div>

              {/* Right Column: Challenges List */}
              <div className="challenge-list-container">
                <p className="body-text font-semibold text-[var(--text-main)] mb-2" style={{ textAlign: "left" }}>
                  The primary challenges that these pastors are facing in India are:
                </p>
                <div className="challenge-list-item reveal">
                  <div className="challenge-list-number">01</div>
                  <div className="challenge-list-content">
                    <h3 className="challenge-list-title">Family Dependency</h3>
                    <p className="body-text" style={{ fontSize: "14.5px" }}>Most of the pastors in villages in India have families dependent on their work to make a living, which hinders them from going anywhere for an extended period of study.</p>
                  </div>
                </div>

                <div className="challenge-list-item reveal stagger-1">
                  <div className="challenge-list-number">02</div>
                  <div className="challenge-list-content">
                    <h3 className="challenge-list-title">Financial Barriers</h3>
                    <p className="body-text" style={{ fontSize: "14.5px" }}>The financial status of most of their churches is not strong enough to support theological training. The pastors cannot afford the high costs of theological education in India, and it remains a dream for most of them.</p>
                  </div>
                </div>

                <div className="challenge-list-item reveal stagger-2">
                  <div className="challenge-list-number">03</div>
                  <div className="challenge-list-content">
                    <h3 className="challenge-list-title">The Language Divide</h3>
                    <p className="body-text" style={{ fontSize: "14.5px" }}>The formal theological training is in English, but most of them speak only their local languages.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vision & Mission Section */}
        <div className="vm-section">
          <div className="container text-center">
            <span className="label text-center">Our Response</span>
            <h2 className="heading-section" style={{ marginBottom: "2rem" }}>Responding to the Challenge</h2>
            <p className="body-text" style={{ marginBottom: "4rem", maxWidth: "800px", margin: "0 auto 4rem" }}>
              CWAY ACADEMY is a vision shared by dedicated Bible teachers, pastors, media professionals, and other professionals who are willing and ready to reach and serve the church and missions in India. We envision responding to the crisis of insufficiently trained Christian leadership in remote villages in India by providing biblically based leadership training to pastors and lay leaders in their places of ministry.
            </p>

            <div className="vm-grid">
              <div className="vm-card-green reveal">
                <div className="vm-letter">VISION</div>
                <h3 className="vm-header">Vision</h3>
                <p className="vm-text">Our vision is to equip Christ&apos;s disciples as frontline leaders through theological education, leadership training, and ministerial practice to fulfil Christ&apos;s Great Commission.</p>
              </div>
              <div className="vm-card-gold reveal stagger-1">
                <div className="vm-letter">MISSION</div>
                <h3 className="vm-header">Mission</h3>
                <p className="vm-text">The CWAY ACADEMY provides holistic, hands-on training for indigenous pastors, leaders, and believers in local churches. We offer each individual a hybrid learning experience that is comfortable and globally certified, with Christian leadership training. We develop potential leaders who can contribute to the Christian church and community.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="team-section">
          <div className="container">
            <div className="text-center">
              <span className="label text-center">The People Behind The Vision</span>
              <h2 className="heading-section">Leadership Team</h2>
            </div>

            <div className="team-list-container">
              <div className="modern-team-row-card reveal">
                <div className="team-row-left">
                  <div className="team-avatar-container">
                    <img src="/Reeju.png" alt="Dr. Reeju Tharakan" className="w-full h-full rounded-full object-cover relative z-10" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", objectPosition: "85% 20%", position: "relative", zIndex: 10 }} />
                  </div>
                  <div className="team-role">Executive Director</div>
                  <span className="team-credential-badge">M.Th., Ph.D.</span>
                </div>
                <div className="team-row-right">
                  <h3 style={{ fontSize: "22px", fontWeight: 600 }}>Dr.&nbsp;Reeju Tharakan</h3>
                  <div className="team-separator" />
                  <div className="body-text" style={{ fontSize: "15px", lineHeight: "1.7", textAlign: "justify", wordSpacing: "-0.02em" }}>
                    <p style={{ marginBottom: "1rem" }}>With a Ph.D. in Christian Studies and a Master of Theology in History of Christianity and 24 years of experience in theological education, Dr.&nbsp;Reeju forged a vision to provide an optimized theological learning opportunity for every Local Church and Leader.</p>
                    <p style={{ marginBottom: "1rem" }}>As a theological educator, he served at Southern Asia Bible College, Bangalore, as an Assistant Professor for 13 years, then as an international faculty member at SUM Bible College and Theological Seminary, California, and as Dean of M.Th. studies at Bethel New Life College, Bangalore.</p>
                    <p>Presently, he is the Lead Pastor of Immanuel AG Church in Dubai and is involved in teaching, training, developing curricula, and launching new theological programs. He is also the President-Trustee of the CWAY Missions Religious Trust, Bangalore.</p>
                  </div>
                </div>
              </div>

              <div className="modern-team-row-card reveal stagger-1">
                <div className="team-row-left">
                  <div className="team-avatar-container">
                    <img src="/Robin.png" alt="Pr. Robin Ninan" className="w-full h-full rounded-full object-cover relative z-10" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", objectPosition: "center 20%", position: "relative", zIndex: 10 }} />
                  </div>
                  <div className="team-role">Director of Training & Outreach</div>
                  <span className="team-credential-badge">M.Div., Media Specialist</span>
                </div>
                <div className="team-row-right">
                  <h3 style={{ fontSize: "22px", fontWeight: 600 }}>Pr.&nbsp;Robin Ninan</h3>
                  <div className="team-separator" />
                  <div className="body-text" style={{ fontSize: "15px", lineHeight: "1.7", textAlign: "justify", wordSpacing: "-0.02em" }}>
                    <p style={{ marginBottom: "1rem" }}>Holding a Master of Divinity and extensive experience in leadership, management, and media, Pr.&nbsp;Robin envisions using his experience to reach and organize learning and training programs for pastors and leaders of the Christian community and local churches.</p>
                    <p style={{ marginBottom: "1rem" }}>He served as the Broadcasting and Production Manager at a Christian channel for 13 years and initiated leadership training and skill-development programs for youth in rural India.</p>
                    <p>He continued to enrich rural pastors and leaders through the media. He is also the Secretary-Trustee of the CWAY Missions Religious Trust, Bangalore.</p>
                  </div>
                </div>
              </div>

              <div className="modern-team-row-card reveal stagger-2">
                <div className="team-row-left">
                  <div className="team-avatar-container">
                    <img src="/Finny.png" alt="Mr. Finny Philip Varghese" className="w-full h-full rounded-full object-cover relative z-10" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", objectPosition: "center 20%", position: "relative", zIndex: 10 }} />
                  </div>
                  <div className="team-role">Director of Operations</div>
                  <span className="team-credential-badge">B.Tech., Operations Leader</span>
                </div>
                <div className="team-row-right">
                  <h3 style={{ fontSize: "22px", fontWeight: 600 }}>Mr.&nbsp;Finny Philip Varghese</h3>
                  <div className="team-separator" />
                  <div className="body-text" style={{ fontSize: "15px", lineHeight: "1.7", textAlign: "justify", wordSpacing: "-0.02em" }}>
                    <p style={{ marginBottom: "1rem" }}>Education in IT and computers, and a very engaged Christian upbringing, enabled Mr.&nbsp;Finny to draw on more than a decade of professional experience, including roles at multinational companies such as Dell, forming and administering trusts for skill development, and organizing Church gatherings.</p>
                    <p style={{ marginBottom: "1rem" }}>He is the Founder and Operations Head of ARTnTEQ GLOBAL SERVICES and its subsidiaries.</p>
                    <p>He is an entrepreneur with a vision to equip and emancipate lay leaders, with a genuine emphasis on the Kingdom&apos;s purpose. He is also the Treasurer-Trustee of the CWAY Missions Religious Trust in Bangalore.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── COURSES PAGE ─── */}
      <section id="courses" className="page" style={getPageStyle("courses")}>
        <div className="page-header">
          <div className="container reveal">
            <span className="label text-center">What We Teach</span>
            <h1 className="headline-page">The Courses Offered</h1>
            <p className="body-text">Biblically grounded. Locally delivered. Globally certified.</p>
          </div>
        </div>

        <div className="section container">
          {isLoadingCourses ? (
            <div style={{ textAlign: "center", padding: "4rem 0" }}>
              <p className="body-text">Loading courses...</p>
            </div>
          ) : !courses?.length ? (
            <div style={{ textAlign: "center", padding: "4rem 0", background: "#FFFFFF", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: "20px", marginBottom: "1rem", color: "var(--text-main)" }}>No Courses Available Yet</h3>
              <p className="body-text">Check back soon for upcoming courses.</p>
            </div>
          ) : (
            <div className="grid-3">
              {courses.map((c: any, i: number) => (
                <div key={c.id} className={`card course-card reveal ${i % 3 === 1 ? "stagger-1" : i % 3 === 2 ? "stagger-2" : ""}`}>
                  <div>
                    <div className="course-badges">
                      <span className="badge">{c.weeksDuration} Wks</span>
                      {c.totalLectures > 0 && <span className="badge">{c.totalLectures} Lectures</span>}
                      {c.level && <span className="badge">{c.level}</span>}
                    </div>
                    <h3 style={{ fontSize: "20px", marginBottom: "0.75rem", fontFamily: "Georgia, serif" }}>{c.title}</h3>
                    <p className="body-text" style={{ fontSize: "14.5px" }}>{c.subtitle || c.description?.substring(0, 100) || "Learn the foundations of this topic."}</p>
                  </div>
                  <div style={{ marginTop: "1.5rem" }}>
                    <Link href={`/courses/${c.slug}`} style={{ display: "inline-block", color: "var(--accent-green)", fontWeight: 700, fontSize: "13px", textDecoration: "none", textTransform: "uppercase", letterSpacing: "1px" }}>
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center reveal" style={{ marginTop: "4rem" }}>
            <div className="bank-card" style={{ display: "inline-block" }}>
              <h3 style={{ fontSize: "22px", marginBottom: "1rem", color: "var(--accent-green)" }}>Graduation & Certification</h3>
              <p className="body-text" style={{ maxWidth: "600px", margin: "0 auto", fontSize: "14.5px" }}>Students who complete all courses and meet the requirements will receive a globally accredited certificate upon graduation. Graduation services will be conducted locally.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── GET INVOLVED PAGE ─── */}
      <section id="involved" className="page" style={getPageStyle("involved")}>
        <div className="page-header">
          <div className="container reveal">
            <span className="label text-center">An Extraordinary Calling</span>
            <h1 className="headline-page">Partner With Us</h1>
            <p className="body-text">We request your partnership to help train Christian leaders for the church in India. Village churches cannot afford training costs without your help.</p>
          </div>
        </div>

        <div className="section container grid-2">
          <div className="reveal">
            <span className="label">Ways to Help</span>
            <h2 className="heading-section">How to be part of this mission</h2>
            <ul className="partner-list" style={{ marginTop: "3rem" }}>
              <li>Become a prayer partner. Get in touch with us to choose a prayer option.</li>
              <li>Contribute a one-time gift of Rs. 15,000/- to sponsor one candidate for 15 months.</li>
              <li>Partner with this project by pledging a monthly amount.</li>
              <li>Share this vision with like-minded people.</li>
              <li>Get in touch with us for other partnering opportunities.</li>
            </ul>
            <div style={{ marginTop: "3rem" }}>
              <a href="#contact" className="btn-primary">Get in Touch to Partner</a>
            </div>
          </div>
          <div className="reveal stagger-1">
            <div className="bank-card">
              <h3 style={{ fontSize: "26px", marginBottom: "1.5rem" }}>Bank Details</h3>
              <p className="body-text" style={{ fontSize: "16px", lineHeight: 2.2 }}>
                <strong>Account Name:</strong> CWAY MISSIONS<br />
                <strong>Bank:</strong> Federal Bank — Banaswadi Branch<br />
                <strong>Account No:</strong> 14710200017349<br />
                <strong>IFSC:</strong> FDRL0001471
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BLOG PAGE ─── */}
      <section id="blog" className="page" style={getPageStyle("blog")}>
        <div className="page-header">
          <div className="container reveal">
            <span className="label text-center">Stories from the field</span>
            <h1 className="headline-page">Insights & Reflections</h1>
            <p className="body-text">Learning from those who went before us in the mission field.</p>
          </div>
        </div>

        <div
          className="section container"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2.5rem",
            alignItems: "stretch",
            paddingTop: "4rem",
            paddingBottom: "4rem"
          }}
        >
          {posts.map((post, idx) => (
            <div
              key={post.slug}
              className={`card blog-card reveal ${idx % 2 === 1 ? 'stagger-1' : ''}`}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
                background: "#FFFFFF",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-sm)",
                borderTop: "4px solid var(--accent-gold)",
                overflow: "hidden",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
            >
              <div className="blog-content" style={{ display: "flex", flexDirection: "column", flexGrow: 1, height: "100%", justifyContent: "space-between" }}>
                <div>
                  <div className="blog-label-bar"></div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span className="label" style={{ margin: 0 }}>Blog {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>{post.date}</span>
                  </div>

                  <h3 style={{ fontSize: "20px", color: "var(--text-main)", marginBottom: "1rem", fontFamily: "var(--font-dm-serif), serif", fontWeight: 700, lineHeight: 1.35 }}>
                    {post.title}
                  </h3>

                  <p className="body-text" style={{ fontSize: "14.5px", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                    {post.excerpt}
                  </p>
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", borderTop: "1px solid var(--border)", paddingTop: "1rem", marginTop: "1rem" }}>
                    <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-green), var(--accent-green-light))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ color: "var(--bg-main)", fontFamily: "var(--font-dm-serif), serif", fontWeight: 700, fontSize: "12px" }}>
                        {post.author[0]}
                      </span>
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 600, fontSize: "12px", color: "var(--text-main)", lineHeight: 1.2 }}>{post.author}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{post.authorRole}</div>
                    </div>
                    <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--text-muted)" }}>{post.readTime} read</span>
                  </div>

                  <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    <button
                      onClick={() => setSelectedBlogPost(post)}
                      className="blog-read"
                      style={{
                        border: "none",
                        background: "none",
                        padding: 0,
                        margin: 0,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: 700,
                        color: "var(--accent-green)",
                        textTransform: "uppercase",
                        fontSize: "12px",
                        letterSpacing: "1.5px",
                        cursor: "pointer"
                      }}
                    >
                      Read Full Story →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CONTACT PAGE ─── */}
      <section id="contact" className="page" style={getPageStyle("contact")}>
        <div 
          className="section container text-center" 
          style={{ 
            minHeight: "calc(100vh - 80px)", 
            display: "flex", 
            flexDirection: "column",
            alignItems: "center", 
            justifyContent: "center",
            paddingTop: "5rem",
            paddingBottom: "5rem"
          }}
        >
          <div className="reveal" style={{ width: "100%", margin: "0 auto" }}>
            <span className="label text-center" style={{ color: "var(--accent-gold)" }}>A Question For You</span>
            <h1 className="headline-page" style={{ margin: "1.5rem 0" }}>&ldquo;Is it too late for you to be equipped for God&apos;s calling?&rdquo;</h1>
            <p className="sub-heading" style={{ marginBottom: "3rem" }}>&ldquo;Keep your hope alive. The Lord has already prepared a path for you.&rdquo;</p>

            <ContactContent />
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* Footer */}
      <footer className="footer-main">
        <div className="container footer-grid-container">
          <div>
            <div className="nav-logo-text" style={{ marginBottom: "1.2rem" }}><span className="logo-cway">CWAY</span><span className="logo-academy"> ACADEMY</span></div>
            <p className="body-text footer-brand-desc">Equipping Frontline Leaders for God&apos;s Great Commission.<br />A CWAY Missions Project · Bangalore, India</p>
            <div style={{ marginTop: "1.5rem" }}>
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=support@cwayacademy.com" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: "1.5px", color: "var(--accent-gold)", textDecoration: "none" }}>SUPPORT@CWAYACADEMY.COM</a>
            </div>
          </div>
          <div>
            <h4 style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "1.5rem", color: "var(--text-main)", fontSize: "13px" }}>Quick Links</h4>
            <div className="footer-links-col">
              <a href="#home" className="body-text" style={{ textDecoration: "none", color: "var(--text-muted)", transition: "color 0.3s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-green)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>Home</a>
              <a href="#about" className="body-text" style={{ textDecoration: "none", color: "var(--text-muted)", transition: "color 0.3s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-green)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>About Us</a>
              <a href="#courses" className="body-text" style={{ textDecoration: "none", color: "var(--text-muted)", transition: "color 0.3s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-green)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>Our Courses</a>
              <a href="#involved" className="body-text" style={{ textDecoration: "none", color: "var(--text-muted)", transition: "color 0.3s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-green)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>Get Involved</a>
            </div>
          </div>
          <div>
            <h4 style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "1.5rem", color: "var(--text-main)", fontSize: "13px" }}>Contact Info</h4>
            <p className="body-text" style={{ fontSize: "14.5px", lineHeight: "1.8", color: "var(--text-muted)", margin: 0 }}>
              CWAY Missions Religious Trust<br />
              Bangalore, Karnataka, India<br /><br />
              <strong style={{ color: "var(--text-main)", fontWeight: 600 }}>Phone Inquiries:</strong><br />
              +91 96638 31220
            </p>
          </div>
        </div>
        <div className="container">
          <div className="footer-bottom-bar">
            <div className="footer-copyright">&copy; 2026 CWAY Academy — A Ministry of CWAY Missions, Bangalore, India. All rights reserved.</div>
            <div className="footer-legal-links">
              <a href="#privacy" onClick={(e) => { e.preventDefault(); setShowPrivacyModal(true); }} style={{ color: "var(--text-muted)", textDecoration: "none", transition: "color 0.3s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-main)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>Privacy Policy</a>
              <a href="#terms" onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }} style={{ color: "var(--text-muted)", textDecoration: "none", transition: "color 0.3s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-main)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Reader Overlay */}
      <AnimatePresence>
        {selectedBlogPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
              backgroundColor: "rgba(26, 38, 29, 0.75)",
              backdropFilter: "blur(12px)"
            }}
            onClick={() => setSelectedBlogPost(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.5 }}
              style={{
                backgroundColor: "var(--bg-main)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-xl)",
                maxWidth: "760px",
                width: "100%",
                maxHeight: "85vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Sticky Header */}
              <div
                style={{
                  padding: "1.75rem 2rem",
                  borderBottom: "1px solid var(--border)",
                  backgroundColor: "#FFFFFF",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "1.5rem"
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <span className="label" style={{ marginBottom: "0.25rem", display: "inline-block", color: "var(--accent-gold)" }}>{selectedBlogPost.category}</span>
                  <h2
                    style={{
                      fontSize: "clamp(1.2rem, 3vw, 1.75rem)",
                      lineHeight: 1.3,
                      color: "var(--text-main)",
                      fontFamily: "var(--font-dm-serif), serif",
                      fontWeight: 700
                    }}
                  >
                    {selectedBlogPost.title}
                  </h2>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "12px", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                    <span style={{ fontWeight: 600, color: "var(--accent-green)" }}>{selectedBlogPost.author}</span>
                    <span>•</span>
                    <span>{selectedBlogPost.authorRole}</span>
                    <span>•</span>
                    <span>{selectedBlogPost.date}</span>
                    <span>•</span>
                    <span>{selectedBlogPost.readTime} read</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBlogPost(null)}
                  style={{
                    padding: "0.5rem",
                    borderRadius: "50%",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    flexShrink: 0
                  }}
                  className="hover-close"
                  aria-label="Close reader"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div
                data-lenis-prevent
                style={{
                  padding: "2rem 2.5rem",
                  overflowY: "auto",
                  backgroundColor: "var(--bg-main)",
                  overscrollBehavior: "contain"
                }}
              >
                <div style={{ maxWidth: "660px", margin: "0 auto", textAlign: "left" }}>
                  {/* Lead excerpt */}
                  <p
                    style={{
                      fontSize: "1.05rem",
                      lineHeight: 1.8,
                      fontWeight: 500,
                      color: "var(--accent-green)",
                      marginBottom: "2rem",
                      borderLeft: "3.5px solid var(--accent-gold)",
                      paddingLeft: "1.25rem"
                    }}
                  >
                    {selectedBlogPost.excerpt}
                  </p>

                  {/* Render paragraphs dynamically */}
                  <div style={{ lineHeight: 1.9, color: "var(--text-muted)" }}>
                    {selectedBlogPost.content.split("\n\n").map((para: string, i: number) => {
                      const trimmed = para.trim();
                      if (trimmed.startsWith("“") && trimmed.endsWith("”")) {
                        return (
                          <blockquote
                            key={i}
                            style={{
                              borderLeft: "4px solid var(--accent-gold)",
                              paddingLeft: "1.5rem",
                              fontStyle: "italic",
                              margin: "2rem 0",
                              fontSize: "1.1rem",
                              color: "var(--accent-green)",
                              fontFamily: "var(--font-dm-serif), serif"
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
                              fontSize: "1.2rem",
                              color: "var(--text-main)",
                              fontFamily: "var(--font-dm-serif), serif",
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
                          style={{ marginBottom: "1.25rem", fontSize: "15px" }}
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
                  borderTop: "1px solid var(--border)",
                  backgroundColor: "#FFFFFF",
                  display: "flex",
                  justifyContent: "flex-end"
                }}
              >
                <button
                  onClick={() => setSelectedBlogPost(null)}
                  style={{
                    padding: "0.75rem 2rem",
                    borderRadius: "50px",
                    border: "1px solid var(--border)",
                    backgroundColor: "transparent",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  className="hover-btn-close"
                >
                  Close Article
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
              backgroundColor: "rgba(26, 38, 29, 0.75)",
              backdropFilter: "blur(12px)"
            }}
            onClick={() => setShowPrivacyModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.5 }}
              style={{
                backgroundColor: "var(--bg-main)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-xl)",
                maxWidth: "760px",
                width: "100%",
                maxHeight: "85vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Sticky Header */}
              <div
                style={{
                  padding: "1.75rem 2rem",
                  borderBottom: "1px solid var(--border)",
                  backgroundColor: "#FFFFFF",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "1.5rem"
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <span className="label" style={{ marginBottom: "0.25rem", display: "inline-block", color: "var(--accent-gold)" }}>Legal Documents</span>
                  <h2
                    style={{
                      fontSize: "clamp(1.2rem, 3vw, 1.75rem)",
                      lineHeight: 1.3,
                      color: "var(--text-main)",
                      fontFamily: "var(--font-serif), serif",
                      fontWeight: 700
                    }}
                  >
                    Privacy Policy
                  </h2>
                </div>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  style={{
                    padding: "0.5rem",
                    borderRadius: "50%",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    flexShrink: 0
                  }}
                  className="hover-close"
                  aria-label="Close reader"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div
                data-lenis-prevent
                style={{
                  padding: "2rem 2.5rem",
                  overflowY: "auto",
                  backgroundColor: "var(--bg-main)",
                  overscrollBehavior: "contain"
                }}
              >
                <div style={{ maxWidth: "660px", margin: "0 auto", textAlign: "left" }}>
                  <p style={{ fontSize: "14.5px", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    Last Updated: June 2026
                  </p>
                  <p style={{ fontSize: "15px", color: "var(--text-main)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    CWAY Academy and the CWAY Missions Religious Trust respect your privacy and are committed to protecting it through our compliance with this policy. This Privacy Policy describes the types of information we may collect from you or that you may provide when you visit our website, register for training, or communicate with us, and our practices for collecting, using, maintaining, protecting, and disclosing that information.
                  </p>

                  <h3 style={{ fontSize: "18px", color: "var(--text-main)", fontWeight: 700, margin: "1.5rem 0 0.75rem", fontFamily: "var(--font-serif), serif" }}>1. Information We Collect</h3>
                  <p style={{ fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    We collect personal information that you voluntarily provide to us when you fill out contact forms, apply for admission, request scholarships, or subscribe to updates. This information may include:
                  </p>
                  <ul style={{ paddingLeft: "1.5rem", marginBottom: "1.5rem", listStyleType: "disc", fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.8 }}>
                    <li>Personal identification information (such as name, email address, phone number, and mailing address).</li>
                    <li>Ministry and academic background details provided in connection with enrollment or scholarship inquiries.</li>
                    <li>Payment information and donor records in connection with sponsorships or donations.</li>
                  </ul>

                  <h3 style={{ fontSize: "18px", color: "var(--text-main)", fontWeight: 700, margin: "1.5rem 0 0.75rem", fontFamily: "var(--font-serif), serif" }}>2. How We Use Your Information</h3>
                  <p style={{ fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    We use the information we collect for the following purposes:
                  </p>
                  <ul style={{ paddingLeft: "1.5rem", marginBottom: "1.5rem", listStyleType: "disc", fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.8 }}>
                    <li>To facilitate admissions, enrollment, academic assessments, and hybrid class workshops.</li>
                    <li>To coordinate and manage local graduation ceremonies.</li>
                    <li>To process and record sponsorships and charitable contributions.</li>
                    <li>To respond to your inquiries, support requests, or partnership applications.</li>
                    <li>To send updates or newsletters about CWAY Academy and CWAY Missions Trust.</li>
                  </ul>

                  <h3 style={{ fontSize: "18px", color: "var(--text-main)", fontWeight: 700, margin: "1.5rem 0 0.75rem", fontFamily: "var(--font-serif), serif" }}>3. Data Protection and Security</h3>
                  <p style={{ fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    We implement appropriate administrative, physical, and electronic security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, please note that no transmission of data over the internet can be guaranteed as completely secure.
                  </p>

                  <h3 style={{ fontSize: "18px", color: "var(--text-main)", fontWeight: 700, margin: "1.5rem 0 0.75rem", fontFamily: "var(--font-serif), serif" }}>4. Information Sharing and Disclosure</h3>
                  <p style={{ fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    We do not sell, rent, or trade your personal identification information. We may share details with trusted third-party service providers (such as hosting partners or platform administrators) who assist us in operating our educational platforms and conducting our ministries, provided those partners agree to keep this information confidential.
                  </p>

                  <h3 style={{ fontSize: "18px", color: "var(--text-main)", fontWeight: 700, margin: "1.5rem 0 0.75rem", fontFamily: "var(--font-serif), serif" }}>5. Your Rights and Contact Info</h3>
                  <p style={{ fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    You have the right to request access to the personal data we hold about you, request corrections to any inaccuracies, or ask for deletion of your records. For any requests or inquiries, please contact us at:
                  </p>
                  <p style={{ fontSize: "15px", color: "var(--accent-green)", fontWeight: 600, lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    Email: support@cwayacademy.com<br />
                    Address: CWAY Missions Religious Trust, Bangalore, Karnataka, India
                  </p>
                </div>
              </div>

              {/* Modal Sticky Footer */}
              <div
                style={{
                  padding: "1.25rem 2rem",
                  borderTop: "1px solid var(--border)",
                  backgroundColor: "#FFFFFF",
                  display: "flex",
                  justifyContent: "flex-end"
                }}
              >
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  style={{
                    padding: "0.75rem 2rem",
                    borderRadius: "50px",
                    border: "1px solid var(--border)",
                    backgroundColor: "transparent",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  className="hover-btn-close"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms of Service Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
              backgroundColor: "rgba(26, 38, 29, 0.75)",
              backdropFilter: "blur(12px)"
            }}
            onClick={() => setShowTermsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.5 }}
              style={{
                backgroundColor: "var(--bg-main)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-xl)",
                maxWidth: "760px",
                width: "100%",
                maxHeight: "85vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Sticky Header */}
              <div
                style={{
                  padding: "1.75rem 2rem",
                  borderBottom: "1px solid var(--border)",
                  backgroundColor: "#FFFFFF",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "1.5rem"
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <span className="label" style={{ marginBottom: "0.25rem", display: "inline-block", color: "var(--accent-gold)" }}>Legal Documents</span>
                  <h2
                    style={{
                      fontSize: "clamp(1.2rem, 3vw, 1.75rem)",
                      lineHeight: 1.3,
                      color: "var(--text-main)",
                      fontFamily: "var(--font-serif), serif",
                      fontWeight: 700
                    }}
                  >
                    Terms of Service
                  </h2>
                </div>
                <button
                  onClick={() => setShowTermsModal(false)}
                  style={{
                    padding: "0.5rem",
                    borderRadius: "50%",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    flexShrink: 0
                  }}
                  className="hover-close"
                  aria-label="Close reader"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div
                data-lenis-prevent
                style={{
                  padding: "2rem 2.5rem",
                  overflowY: "auto",
                  backgroundColor: "var(--bg-main)",
                  overscrollBehavior: "contain"
                }}
              >
                <div style={{ maxWidth: "660px", margin: "0 auto", textAlign: "left" }}>
                  <p style={{ fontSize: "14.5px", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    Last Updated: June 2026
                  </p>
                  <p style={{ fontSize: "15px", color: "var(--text-main)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    Welcome to CWAY Academy. By accessing our website, participating in our hybrid training programs, or using any services provided by CWAY Academy and CWAY Missions Religious Trust, you agree to comply with and be bound by the following Terms of Service. If you do not agree, please do not access or use our services.
                  </p>

                  <h3 style={{ fontSize: "18px", color: "var(--text-main)", fontWeight: 700, margin: "1.5rem 0 0.75rem", fontFamily: "var(--font-serif), serif" }}>1. Admission and Code of Conduct</h3>
                  <p style={{ fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    CWAY Academy provides Bible-based leadership training primarily intended for pastors, church elders, lay leaders, and Christian believers seeking to grow in spiritual leadership. All student participants are expected to communicate respectfully, engage with program coordinators constructively, and provide accurate background and credentials during enrollment.
                  </p>

                  <h3 style={{ fontSize: "18px", color: "var(--text-main)", fontWeight: 700, margin: "1.5rem 0 0.75rem", fontFamily: "var(--font-serif), serif" }}>2. Academic Policies and Course Materials</h3>
                  <p style={{ fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    The structure of CWAY Academy comprises a total of ten courses spanning a duration of 60 weeks (6 weeks per course).
                  </p>
                  <ul style={{ paddingLeft: "1.5rem", marginBottom: "1.5rem", listStyleType: "disc", fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.8 }}>
                    <li><strong>Material Usage:</strong> All video lectures, transcripts, notes, and theological study sheets provided are the intellectual property of CWAY Academy. You are granted a limited license to use these materials solely for personal learning and study. Distributing or copying them for commercial purposes is strictly prohibited.</li>
                    <li><strong>Graduation Requirements:</strong> To obtain the globally certified graduation credentials, students must complete all 10 courses, submit all evaluations, and fulfill feedback requirements.</li>
                  </ul>

                  <h3 style={{ fontSize: "18px", color: "var(--text-main)", fontWeight: 700, margin: "1.5rem 0 0.75rem", fontFamily: "var(--font-serif), serif" }}>3. Tuition and Scholarships</h3>
                  <p style={{ fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    CWAY Academy is committed to making education accessible to rural leaders. Tuition rates and payment periods are detailed in the courses block. Scholarships are available to candidates with proven financial constraints, sponsored directly by donation partners. Satisfying eligibility criteria is mandatory for scholarship allocation.
                  </p>

                  <h3 style={{ fontSize: "18px", color: "var(--text-main)", fontWeight: 700, margin: "1.5rem 0 0.75rem", fontFamily: "var(--font-serif), serif" }}>4. Limitation of Liability</h3>
                  <p style={{ fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    All educational materials and platform operations are provided "as is" and "as available". We do not warrant that files or platforms will be completely error-free or uninterrupted. CWAY Academy and CWAY Missions Religious Trust will not be liable for any indirect, incidental, or consequential damages resulting from your use of or inability to use our services.
                  </p>

                  <h3 style={{ fontSize: "18px", color: "var(--text-main)", fontWeight: 700, margin: "1.5rem 0 0.75rem", fontFamily: "var(--font-serif), serif" }}>5. Jurisdiction and Governing Law</h3>
                  <p style={{ fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                    These Terms of Service are governed by and construed in accordance with the laws of India. Any disputes arising in connection with these terms or CWAY Academy services will be subject to the exclusive jurisdiction of the courts located in Bangalore, Karnataka, India.
                  </p>
                </div>
              </div>

              {/* Modal Sticky Footer */}
              <div
                style={{
                  padding: "1.25rem 2rem",
                  borderTop: "1px solid var(--border)",
                  backgroundColor: "#FFFFFF",
                  display: "flex",
                  justifyContent: "flex-end"
                }}
              >
                <button
                  onClick={() => setShowTermsModal(false)}
                  style={{
                    padding: "0.75rem 2rem",
                    borderRadius: "50px",
                    border: "1px solid var(--border)",
                    backgroundColor: "transparent",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  className="hover-btn-close"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
