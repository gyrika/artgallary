import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft, ArrowRight, Check, ChevronDown, Expand, Grid2X2, Heart,
  AtSign, LayoutPanelTop, Menu, Minus, Search, ShoppingBag, X, ZoomIn
} from "lucide-react";
import "./styles.css";

const artworks = [
  { id:"her", title:"Her", year:"2025", medium:"Oil, acrylic, graphite & bronze leaf on linen", size:"92 × 115 cm", availability:"Available", image:"/art/her.jpg", orientation:"Portrait", theme:"Inner Awareness", description:"A meditation on quiet resilience and the concealed territories of the self. Architectural lines hold a figure between an inherited city and a living, botanical consciousness." },
  { id:"city-lights", title:"City Lights Through the Rain", year:"2025", medium:"Oil, acrylic & graphite on canvas", size:"140 × 94 cm", availability:"Available", image:"/art/city-lights.jpg", orientation:"Square", theme:"Urban Reflections", description:"Colombo after the monsoon becomes a field of reflection—built form dissolving into water, light and remembered movement." },
  { id:"cycles", title:"Cycles of Awakening", year:"2024", medium:"Acrylic, mineral pigment & gold leaf on raw linen", size:"110 × 110 cm", availability:"Reserved", image:"/art/cycles-awakening.jpg", orientation:"Portrait", theme:"Cycles of Transformation", description:"Lotus, seed, orbit and rainwater converge as a symbolic map of consciousness in continual transformation." },
  { id:"threshold", title:"Threshold of Stillness", year:"2024", medium:"Mixed media on linen", size:"78 × 98 cm", availability:"Sold", image:"/art/her.jpg", orientation:"Portrait", theme:"Inner Awareness", description:"A study of the fragile boundary between observation and feeling." },
  { id:"monsoon", title:"Monsoon Geometry", year:"2025", medium:"Oil & graphite on canvas", size:"120 × 80 cm", availability:"Available", image:"/art/city-lights.jpg", orientation:"Square", theme:"Urban Reflections", description:"Rain measures the city in fleeting verticals and illuminated intervals." },
  { id:"return", title:"The Eternal Return", year:"2024", medium:"Mineral pigment on linen", size:"90 × 90 cm", availability:"Available", image:"/art/cycles-awakening.jpg", orientation:"Portrait", theme:"Nature and Consciousness", description:"A quiet cosmology of growth, dissolution and return." }
];

const nav = ["Home","Artworks","Collections","About","Journal","Contact"];
const routeOf = (name) => name === "Home" ? "#/" : `#/${name.toLowerCase()}`;

function useRoute() {
  const [route, setRoute] = useState(location.hash || "#/");
  useEffect(() => {
    const onHash = () => { setRoute(location.hash || "#/"); scrollTo({ top:0, behavior:"smooth" }); };
    addEventListener("hashchange", onHash); return () => removeEventListener("hashchange", onHash);
  }, []);
  return route;
}

function Header({ cart, wishlist }) {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  useEffect(() => { const s=()=>setSolid(scrollY>30); addEventListener("scroll",s); return()=>removeEventListener("scroll",s); },[]);
  return <header className={`site-header ${solid?"solid":""}`}>
    <a href="#/" className="brand"><b>PIYUMINI</b><span>ARTIST</span></a>
    <nav>{nav.map(n=><a key={n} href={routeOf(n)}>{n}</a>)}</nav>
    <div className="header-icons">
      <button aria-label="Search"><Search/></button><a href="https://instagram.com" aria-label="Instagram"><AtSign/></a>
      <a href="#/wishlist" aria-label="Wishlist"><Heart/><i>{wishlist.length}</i></a>
      <a href="#/cart" aria-label="Cart"><ShoppingBag/><i>{cart.length}</i></a>
      <button className="mobile-menu" onClick={()=>setOpen(!open)} aria-label="Menu">{open?<X/>:<Menu/>}</button>
    </div>
    {open&&<div className="mobile-nav">{nav.map(n=><a key={n} onClick={()=>setOpen(false)} href={routeOf(n)}>{n}</a>)}</div>}
  </header>
}

const ArtImage = ({ art, className="" }) => <div className={`art-mat ${className}`}><img src={art.image} alt={`${art.title}, ${art.year}, by Piyumini`} loading="lazy"/></div>;
const TitleBlock = ({ index, eyebrow, title, text }) => <div className="title-block"><span>{index} — {eyebrow}</span><h2>{title}</h2>{text&&<p>{text}</p>}</div>;

function Home({ openArt }) {
  return <>
    <section className="hero">
      <div className="hero-copy fade"><span className="kicker">Contemporary artist · Sri Lanka</span><h1>Art Beyond<br/>the <em>Visible</em></h1>
        <p>Original contemporary works exploring emotion, consciousness, urban memory and the repeating cycles of life.</p>
        <div className="button-row"><a className="button dark" href="#/artworks">Explore the Collection <ArrowRight/></a><a className="text-link" href="#/about">Meet the Artist</a></div>
      </div>
      <div className="hero-work"><ArtImage art={artworks[0]}/><div className="caption"><span>Her, 2025</span><span>Oil & mixed media on linen</span></div></div>
      <div className="scroll-note">Scroll to discover <span>↓</span></div>
    </section>

    <section className="intro page-pad"><span className="kicker">Selected works · 2024–2025</span><p>Where emotion meets structure, and the visible world opens into something <em>felt.</em></p></section>

    <section className="featured page-pad">
      <TitleBlock index="01" eyebrow="Featured artworks" title="Three meditations"/>
      <div className="featured-list">
        {artworks.slice(0,3).map((art,i)=><article className={`feature feature-${i+1}`} key={art.id}>
          <button className="image-button" onClick={()=>openArt(art.id)}><ArtImage art={art}/></button>
          <div className="art-info"><div><span className="status">{art.availability}</span><h3>{art.title}</h3><p>{art.year} · {art.medium}<br/>{art.size}</p></div><div className="art-price"><button onClick={()=>openArt(art.id)}>View artwork <ArrowRight/></button></div></div>
        </article>)}
      </div>
    </section>

    <section className="statement"><div className="statement-mark">“</div><blockquote>I paint the space between what we see and what we feel. Through colour, structure and symbolism, each work explores awareness, memory, emotion and transformation.</blockquote><div className="signature">Piyumini</div><span>Artist statement · Colombo</span></section>

    <section className="collections page-pad">
      <TitleBlock index="02" eyebrow="Explore" title="Collections" text="Bodies of work tracing the recurring ideas and environments within the practice."/>
      <div className="collection-grid">
        {[["Inner Awareness",artworks[0]],["Urban Reflections",artworks[1]],["Cycles of Transformation",artworks[2]],["Nature & Consciousness",artworks[2]],["Available Originals",artworks[1]]].map(([name,art],i)=>
          <a href="#/artworks" className={`collection c${i+1}`} key={name}><img src={art.image} alt=""/><div><span>0{i+1}</span><h3>{name}</h3><b>View collection →</b></div></a>)}
      </div>
    </section>

    <section className="process page-pad">
      <TitleBlock index="03" eyebrow="Inside the studio" title="A work takes form"/>
      <div className="process-track">{["Initial idea","Sketch & composition","Colour studies","Painting process","Final artwork"].map((s,i)=><div key={s}><span>0{i+1}</span><div className={`process-visual p${i+1}`}></div><h3>{s}</h3><p>{["A felt image, recorded before it disappears.","Structure gives intuition somewhere to move.","Pigment, light and emotional temperature.","Layers gather, are erased, and return.","The work leaves the studio with its questions intact."][i]}</p></div>)}</div>
    </section>

    <Trust/>
    <JournalPreview/>
    <Newsletter/>
  </>;
}

function Artworks({ openArt }) {
  const [filter,setFilter]=useState("All"); const [view,setView]=useState("grid");
  const shown=filter==="All"?artworks:artworks.filter(a=>a.availability===filter||a.orientation===filter);
  return <main className="subpage page-pad">
    <div className="page-hero"><span className="kicker">Original works · Sri Lanka</span><h1>Artworks</h1><p>Each work is an inquiry into awareness, memory, transformation and the structures—seen and unseen—that shape our lives.</p></div>
    <div className="filterbar"><div>{["All","Available","Sold","Reserved","Portrait","Landscape","Square"].map(f=><button className={filter===f?"active":""} onClick={()=>setFilter(f)} key={f}>{f}</button>)}</div><div className="view-buttons"><button className={view==="grid"?"active":""} onClick={()=>setView("grid")}><Grid2X2/></button><button className={view==="gallery"?"active":""} onClick={()=>setView("gallery")}><LayoutPanelTop/></button></div></div>
    <div className={`art-grid ${view}`}>{shown.map((art,i)=><article key={art.id} onClick={()=>openArt(art.id)}><ArtImage art={art}/><div><span>{String(i+1).padStart(2,"0")}</span><h3>{art.title}</h3><p>{art.medium}<br/>{art.size}</p><b className={`availability ${art.availability.toLowerCase()}`}>{art.availability}</b></div></article>)}</div>
  </main>;
}

function ArtworkPage({ art, addCart, toggleWish, wished }) {
  const [zoom,setZoom]=useState(false);
  return <main className="artwork-page">
    <div className="artwork-main page-pad">
      <div className="museum-view"><ArtImage art={art}/><button onClick={()=>setZoom(true)}><ZoomIn/> View full screen</button></div>
      <div className="acquire-panel"><span className="kicker">{art.theme} · {art.year}</span><h1>{art.title}</h1><p className="medium">{art.medium}<br/>{art.size}</p><span className={`availability ${art.availability.toLowerCase()}`}>● {art.availability}</span><p className="description">{art.description}</p>
        <dl><div><dt>Framing</dt><dd>Unframed; bespoke framing available</dd></div><div><dt>Authenticity</dt><dd>Signed with certificate of authenticity</dd></div><div><dt>Shipping</dt><dd>Professional worldwide delivery</dd></div></dl>
        <button className="button dark full" disabled={art.availability!=="Available"} onClick={()=>addCart(art)}>Acquire This Artwork <ArrowRight/></button>
        <div className="split-buttons"><a className="button outline" href="#/contact">Make an Inquiry</a><button className="button outline" onClick={()=>toggleWish(art)}><Heart fill={wished?"currentColor":"none"}/> {wished?"Saved":"Add to Wishlist"}</button></div>
      </div>
    </div>
    <section className="art-story page-pad"><span className="kicker">Behind the work</span><h2>A figure held between<br/>memory and becoming.</h2><div><p>{art.description}</p><p>Built slowly through translucent colour, erasure and measured graphite lines, the composition allows organic and engineered forms to coexist. Every surface carries evidence of revision—the history of the painting remains visible.</p></div></section>
    <section className="detail-strip page-pad">{["Materials & process","Artist notes","Care instructions","Shipping & returns"].map(x=><button key={x}>{x}<ChevronDown/></button>)}</section>
    <section className="similar page-pad"><TitleBlock index="—" eyebrow="Continue exploring" title="Similar works"/><div className="similar-grid">{artworks.filter(a=>a.id!==art.id).slice(0,3).map(a=><a href={`#/artwork/${a.id}`} key={a.id}><ArtImage art={a}/><h3>{a.title}</h3></a>)}</div></section>
    {zoom&&<div className="lightbox" onClick={()=>setZoom(false)}><button><X/></button><img src={art.image} alt={art.title}/></div>}
    <button className="sticky-acquire" onClick={()=>addCart(art)}>Acquire This Artwork</button>
  </main>;
}

function Collections(){return <main className="subpage page-pad"><div className="page-hero"><span className="kicker">Bodies of work</span><h1>Collections</h1><p>Recurring worlds—each a sustained meditation across image, material and time.</p></div><div className="collection-page">{[["Inner Awareness","Figures and interior landscapes that ask what remains when the visible falls away.",artworks[0]],["Urban Reflections","Colombo, memory and the emotional architecture of a changing city.",artworks[1]],["Cycles of Transformation","Nature, time and the repeating geometries of becoming.",artworks[2]],["Nature & Consciousness","Botanical forms as vessels for attention and inner movement.",artworks[2]]].map(([n,d,a],i)=><a href="#/artworks" key={n}><ArtImage art={a}/><div><span>0{i+1}</span><h2>{n}</h2><p>{d}</p><b>Explore collection →</b></div></a>)}</div></main>}

function About(){
  return <main className="about-page"><section className="about-hero page-pad"><div><span className="kicker">Artist · Civil engineering student · Observer</span><h1>Structure meets <em>intuition.</em></h1></div><div className="portrait"><div className="portrait-shape"></div><span>In the studio, Sri Lanka · 2025</span></div></section>
    <section className="about-intro page-pad"><span>01 — Biography</span><h2>Studying civil engineering at the University of Ruhuna and drawn toward artistic expression, Piyumini combines structure, geometry and observation with emotion, intuition and symbolic storytelling.</h2><div><p>Piyumini is a Sri Lankan contemporary artist and civil engineering student at the University of Ruhuna. Her work traces the relationship between inner awareness and the environments we inhabit.</p><p>Her civil engineering studies shape an instinct for balance, structure and systems. Against this measured foundation, pigment is allowed to behave intuitively and unpredictably.</p></div></section>
    <section className="philosophy"><div className="texture"></div><div><span className="kicker">02 — Creative philosophy</span><h2>Painting as a form<br/>of attention.</h2><p>The studio is a place to slow down—to notice the emotional charge of colour, the memory held in surfaces, and the quiet intelligence of natural form.</p></div></section>
    <section className="bio-grid page-pad">{[["Influences","Sri Lankan modernism, sacred geometry, monsoon landscapes, urban architecture and the material poetry of weathered surfaces."],["Studio process","Sketchbooks, structural drawings and colour studies begin each work. Painting follows through cycles of layering, scraping and return."],["Education","Civil Engineering student · University of Ruhuna\nIndependent art practice · Sri Lanka"],["Engineering & art","Civil engineering brings an awareness of structure, material and the built environment into Piyumini’s intuitive, emotionally led studio practice."]].map(([h,p])=><div key={h}><h3>{h}</h3><p>{p}</p></div>)}</section>
    <a className="cv-button" href="data:text/plain,Piyumini — Artist CV" download="Piyumini-Artist-CV.txt">Download artist CV ↓</a><Newsletter/>
  </main>
}

const posts=[["The painting beneath the painting","On revision, erasure and allowing a work to keep its history.","Essay · 8 min",artworks[0]],["After the monsoon","Walking Colombo and gathering the colours of reflected light.","Studio journal · 5 min",artworks[1]],["Why circles return","Notes on cycles, consciousness and symbolic form.","Process · 6 min",artworks[2]]];
function JournalPreview(){return <section className="journal-preview page-pad"><TitleBlock index="04" eyebrow="From the journal" title="Notes from the studio"/><div>{posts.map(([t,d,m,a])=><article key={t}><ArtImage art={a}/><span>{m}</span><h3>{t}</h3><p>{d}</p><a href="#/journal">Read story <ArrowRight/></a></article>)}</div></section>}
function Journal(){return <main className="subpage page-pad"><div className="page-hero"><span className="kicker">Writing · Process · Reflection</span><h1>Journal</h1><p>Stories behind the work, notes from the studio and reflections on art, consciousness and place.</p></div><div className="journal-page">{[...posts,...posts].map(([t,d,m,a],i)=><article key={i}><ArtImage art={a}/><div><span>{m}</span><h2>{t}</h2><p>{d}</p><a href="#">Read story →</a></div></article>)}</div></main>}

function Contact(){
  const sendEmail=e=>{e.preventDefault();const data=new FormData(e.currentTarget);const subject=encodeURIComponent(data.get("subject")||"Website inquiry");const body=encodeURIComponent(`Name: ${data.get("name")}\nEmail: ${data.get("email")}\nCountry: ${data.get("country")}\nArtwork: ${data.get("artwork")}\n\n${data.get("message")}`);location.href=`mailto:piyuminiabeysundara@gmail.com?subject=${subject}&body=${body}`};
  return <main className="contact-page page-pad"><div className="contact-intro"><span className="kicker">The studio · Sri Lanka</span><h1>Begin a<br/><em>conversation.</em></h1><p>For acquisitions, exhibitions, commissions and collaborations, please contact the studio.</p><div><a href="mailto:piyuminiabeysundara@gmail.com">piyuminiabeysundara@gmail.com</a><a href="#">Instagram ↗</a></div></div>
    <form onSubmit={sendEmail}><div className="field-row"><label>Name<input name="name" required placeholder="Your full name"/></label><label>Email<input name="email" required type="email" placeholder="you@email.com"/></label></div><div className="field-row"><label>Country<input name="country" placeholder="Where are you based?"/></label><label>Subject<select name="subject"><option>Artwork acquisition</option><option>Gallery & exhibition</option><option>Commission</option><option>Collaboration</option></select></label></div><label>Artwork of interest<select name="artwork"><option>Please select</option>{artworks.map(a=><option key={a.id}>{a.title}</option>)}</select></label><label>Message<textarea name="message" required rows="6" placeholder="Tell us how we can help…"/></label><button className="button dark">Email Piyumini <ArrowRight/></button></form>
  </main>
}

function Cart({cart,remove}){
 const inquirySubject=encodeURIComponent("Artwork acquisition inquiry");
 const inquiryBody=encodeURIComponent(`Hello Piyumini,\n\nI would like to inquire about:\n${cart.map(a=>`• ${a.title}`).join("\n")}\n\nPlease share further details.`);
 return <main className="subpage cart-page page-pad"><div className="page-hero"><span className="kicker">Private acquisition</span><h1>Your selection</h1></div>{!cart.length?<div className="empty"><ShoppingBag/><h2>Your selection is empty</h2><p>Discover original works available directly from the studio.</p><a className="button dark" href="#/artworks">Explore artworks</a></div>:<div className="cart-layout"><div>{cart.map(a=><article key={a.id}><ArtImage art={a}/><div><h2>{a.title}</h2><p>{a.medium}<br/>{a.size}</p></div><button onClick={()=>remove(a.id)}><X/></button></article>)}</div><aside><h3>Selected artworks</h3><p><span>Certificate of authenticity</span><b>Included</b></p><p><span>Professional packaging</span><b>Available</b></p><p><span>Shipping</span><b>Arranged by studio</b></p><a className="button dark full" href={`mailto:piyuminiabeysundara@gmail.com?subject=${inquirySubject}&body=${inquiryBody}`}>Send acquisition inquiry</a><small>Piyumini will respond directly by email.</small></aside></div>}</main>
}

function Wishlist({items,openArt}){return <main className="subpage page-pad"><div className="page-hero"><span className="kicker">Saved works</span><h1>Wishlist</h1></div>{items.length?<div className="art-grid grid">{items.map(a=><article key={a.id} onClick={()=>openArt(a.id)}><ArtImage art={a}/><div><h3>{a.title}</h3><p>{a.medium}</p></div></article>)}</div>:<div className="empty"><Heart/><h2>No saved works yet</h2><a href="#/artworks" className="button dark">Explore artworks</a></div>}</main>}
function Trust(){return <section className="trust">{["Original artwork","Signed by the artist","Certificate of authenticity","Secure payment","Professional packaging","Worldwide shipping"].map((x,i)=><div key={x}><span>0{i+1}</span><Check/><p>{x}</p></div>)}</section>}
function Newsletter(){return <section className="newsletter"><div><span className="kicker">Private studio letters</span><h2>Stay close to<br/>the work.</h2></div><form onSubmit={e=>e.preventDefault()}><p>New paintings, exhibitions and occasional notes from the studio—sent thoughtfully.</p><div><input type="email" required placeholder="Your email address"/><button aria-label="Subscribe"><ArrowRight/></button></div></form></section>}
function Footer(){return <footer><div className="footer-brand"><b>PIYUMINI</b><p>Contemporary works exploring the space between structure, emotion and awareness.</p></div><div><h4>Navigate</h4>{nav.map(n=><a key={n} href={routeOf(n)}>{n}</a>)}</div><div><h4>Visit & contact</h4><a href="mailto:piyuminiabeysundara@gmail.com">piyuminiabeysundara@gmail.com</a><a href="#">Instagram</a><span>Colombo, Sri Lanka</span></div><div><h4>Collector care</h4><a href="#">Shipping policy</a><a href="#">Returns policy</a><a href="#">Privacy policy</a><a href="#">Terms</a></div><small>© 2026 Piyumini Studio. All artworks and images are protected by copyright.</small></footer>}

function App(){
 const route=useRoute(); const [cart,setCart]=useState([]); const [wish,setWish]=useState([]);
 const openArt=id=>location.hash=`#/artwork/${id}`;
 const addCart=art=>setCart(c=>c.some(x=>x.id===art.id)?c:[...c,art]);
 const toggleWish=art=>setWish(w=>w.some(x=>x.id===art.id)?w.filter(x=>x.id!==art.id):[...w,art]);
 let page;
 if(route.startsWith("#/artwork/")){const art=artworks.find(a=>a.id===route.split("/")[2])||artworks[0];page=<ArtworkPage art={art} addCart={addCart} toggleWish={toggleWish} wished={wish.some(x=>x.id===art.id)}/>}
 else if(route==="#/artworks")page=<Artworks openArt={openArt}/>;
 else if(route==="#/collections")page=<Collections/>;
 else if(route==="#/about")page=<About/>;
 else if(route==="#/journal")page=<Journal/>;
 else if(route==="#/contact")page=<Contact/>;
 else if(route==="#/cart")page=<Cart cart={cart} remove={id=>setCart(c=>c.filter(x=>x.id!==id))}/>;
 else if(route==="#/wishlist")page=<Wishlist items={wish} openArt={openArt}/>;
 else page=<Home openArt={openArt}/>;
 return <><Header cart={cart} wishlist={wish}/>{page}<Footer/></>;
}
createRoot(document.getElementById("root")).render(<App/>);
