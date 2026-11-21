import os, json
OUT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE='https://yourfavephotobooth.com'
ARR='<span class="arr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 17L17 7M9 7h8v8"/></svg></span>'
NAV=[('/','Home'),('/photobooths/','Experience'),('/events/','Events'),('/corporate/','Corporate'),('/weddings/','Weddings'),('/faq/','FAQ'),('/contact/','Contact')]
def esc(s): return s.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;').replace('"','&quot;')
def head(title, desc, path, noindex=False):
    url=BASE+path
    LEAD="gtag('event', 'generate_lead');" if path=='/thankyou/' else ''
    rob='noindex, follow' if noindex else 'index, follow, max-image-preview:large'
    canon='' if noindex else f'<link rel="canonical" href="{url}">'
    return f'''<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-7J32PH1851"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){{dataLayer.push(arguments);}}
  gtag('js', new Date());

  gtag('config', 'G-7J32PH1851');
  {LEAD}
</script>
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<meta name="robots" content="{rob}">{canon}
<meta property="og:type" content="website">
<meta property="og:site_name" content="Your Fave Photobooth">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{BASE}/assets/photos/portrait.jpg">
<link rel="icon" href="/assets/logo-blue.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&amp;display=swap">
<script>(function(d){{d.classList.add('js');try{{if(sessionStorage.getItem('yfp:enter')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('entering')}}catch(e){{}}}})(document.documentElement)</script>
<link rel="stylesheet" href="/css/v3.css?v=59">
<script src="/js/v3.js?v=57" defer></script>
</head>
<body>
<div class="wipe" aria-hidden="true"><img src="/assets/logo-white.png" alt=""></div>
'''
def chrome():
    links=''.join(f'<a href="{h}">{l}</a>' for h,l in NAV)
    return f'''<header class="hdr">
 <div class="wrap hdr__in">
  <a href="/" aria-label="Your Fave Photobooth home"><img src="/assets/logo-blue.png" alt="Your Fave Photobooth"></a>
  <nav class="hdr__links" aria-label="Pages">{links}</nav>
  <div class="hdr__r">
   <a class="pill pill--navy" href="/contact/">Book now</a>
   <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu" aria-label="Open menu"><i class="menu-btn__ic" aria-hidden="true"><b></b><b></b></i></button>
  </div>
 </div>
</header>
<nav class="menu" id="menu" aria-label="Main">
<img class="menu__bg" src="/assets/photos/hd/home-cover.jpg" alt="">
 <div class="menu__top"><img src="/assets/logo-white.png" alt="Your Fave Photobooth"><button class="menu__x" type="button" aria-label="Close menu">✕</button></div>
 <nav class="menu__links" aria-label="Pages">{links}</nav>
 <div class="menu__social"><a href="https://www.instagram.com/YOURFAVEPHOTOBOOTH" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".9" fill="currentColor" stroke="none"/></svg>Instagram</a></div>
 <div class="menu__foot"><span>Maryland</span><span>Washington, DC</span><span>Virginia</span></div>
</nav>
'''
def footer():
    pages=''.join(f'<a href="{h}">{l}</a>' for h,l in NAV[1:])
    return f'''<footer class="wrap ft">
 <div class="ft__top">
  <div class="ft__brand"><img src="/assets/logo-blue.png" alt="Your Fave Photobooth"><p class="ft__tag">#1 Portrait Booth Company In Maryland, DC &amp; Virginia</p></div>
  <div><h4>Pages</h4>{pages}</div>
  <div><h4>Follow</h4><a href="https://www.instagram.com/YOURFAVEPHOTOBOOTH" target="_blank" rel="noopener">Instagram</a><a href="#">Facebook</a><a href="#">LinkedIn</a></div>
 </div>
 <div class="ft__bot"><span>© Your Fave Photobooth</span><span>Maryland, Washington DC and Virginia</span></div>
</footer>
'''
def tail(): return '</body>\n</html>\n'
def logo_bar():
    return '<header class="hdr hdr--logo"><div class="wrap hdr__in" style="justify-content:center"><a href="/" aria-label="Your Fave Photobooth home"><img src="/assets/logo-blue.png" alt="Your Fave Photobooth"></a></div></header>\n'
def page(title, desc, path, body, noindex=False, chr_=True, ft=True):
    s=head(title,desc,path,noindex)
    if chr_: s+=chrome()
    s+='<main>\n'+body+'\n</main>\n'
    if ft: s+=footer()
    return s+tail()
def page_bare(title, desc, path, body, noindex=False):
    s=head(title,desc,path,noindex)+logo_bar()+'<main>\n'+body+'\n</main>\n'
    return s+tail()
def svc(items):
    out=''
    for i,(href,img,alt,title) in enumerate(items):
        out+=f'''   <a class="svc__item reveal" href="{href}" data-cursor="View">
    <div class="svc__ph"><img src="/assets/photos/{img}" alt="{esc(alt)}">{ARR}</div>
    <div class="svc__t">{title}</div>
   </a>
'''
    return f'<div class="svc">\n{out}  </div>'
EXP_INCL={'Portrait Booth':['Live professional photographer','Premium backdrop, stanchions and photo rug','Unlimited prints','Digital gallery'],
 'Classic DSLR Photobooth':['Unlimited photos','Live gallery and instant sharing','Custom template design','Attendant on request']}
def chips(name):
    return '<ul class="exp__list">'+''.join(f'<li>{x}</li>' for x in EXP_INCL.get(name,[]))+'</ul>' if name in EXP_INCL else ''
def split(img, alt, title, body, bullets):
    li=''.join(f'<li>{b}</li>' for b in bullets)
    return f'<section class="feat"><div class="feat__ph reveal"><img src="/assets/photos/{img}" alt="{esc(alt)}" loading="lazy"></div><div class="reveal"><h2 class="feat__t">{title}</h2>{f'<p class="feat__p">{body}</p>' if body else ''}<ul class="ticks">{li}</ul></div></section>'
def exp(items):
    out=''
    for href,img,alt,name,kind,desc,price,note in items:
        out+=f'''   <a class="reveal" href="{href}" data-cursor="View">
    <div class="exp__ph"><img src="/assets/photos/{img}" alt="{esc(alt)}"><span class="arr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 17L17 7M9 7h8v8"/></svg></span></div>
    <h3 class="exp__t">{name} <em>{kind}</em></h3>
    <p class="exp__p">{desc}</p>
    <div class="exp__price"><small class="exp__from">Investment starting at</small>{price}<small>{note}</small></div>
   </a>
'''
    return f'<div class="exp">\n{out}  </div>'
def hero(h1, lede, img, alt, btns, pos='', eyebrow=''):
    b=''.join(f'<a class="pill {c}" href="{h}">{t}</a>' for h,t,c in btns)
    return f'''<section class="wrap pg">
 <div class="pg__hero">
  <div>{f'<p class="eyebrow reveal">{eyebrow}</p>' if eyebrow else ''}<h1 class="reveal">{h1}</h1><p class="reveal">{lede}</p><div class="hero__btns reveal">{b}</div></div>
  <div class="pg__ph reveal" data-cursor="View"><img src="/assets/photos/{img}" alt="{esc(alt)}" style="{pos}"></div>
 </div>
</section>'''
def sec(title, inner, pad=''):
    return f'''<section class="wrap sec" {pad}>
 <h2 class="sec__h reveal">{title}</h2>
 {inner}
</section>'''
def edu(cards):
    return '<div class="edu">'+''.join(f'<div class="reveal"><h3>{t}</h3><p>{p}</p></div>' for t,p in cards)+'</div>'
def feat(img, alt, title, body, flip=False):
    return f'<div class="feat{" feat--flip" if flip else ""}"><div class="feat__ph reveal"><img src="/assets/photos/{img}" alt="{esc(alt)}" loading="lazy"></div><div class="reveal"><h2 class="feat__t">{title}</h2><p class="feat__p">{body}</p></div></div>'
def reasons(items):
    return '<div class="reasons">'+''.join(f'<div class="reveal"><p>{t}</p></div>' for n,t in enumerate(items,1))+'</div>'
def cta(h, btn='Check your date'):
    return f'''<section class="wrap cta"><h2 class="reveal">{h}</h2><a class="pill pill--navy reveal" href="/contact/">{btn}</a></section>'''
def mq(imgs):
    one=''.join(f'<img src="/assets/photos/{i}" alt="{esc(a)}" draggable="false" loading="lazy">' for i,a in imgs)
    two=''.join(f'<img src="/assets/photos/{i}" alt="{esc(a)}" draggable="false" loading="lazy">' for i,a in reversed(imgs))
    return f'<div class="mq reveal"><div class="mq__row" data-dir="fwd">{one}</div><div class="mq__row mq__row--2" data-dir="rev">{two}</div></div>'
def car(imgs):
    items=''.join(f'<img src="/assets/photos/{i}" alt="{esc(a)}" draggable="false" loading="lazy">' for i,a in imgs)
    return f'<div class="car reveal" data-car><div class="car__track">{items}</div><div class="car__nav"><button class="car__btn" type="button" data-prev aria-label="Previous photos">&#8592;</button><button class="car__btn" type="button" data-next aria-label="Next photos">&#8594;</button></div></div>'
def gal(imgs):
    return '<div class="gal reveal">'+''.join(f'<div><img src="/assets/photos/{i}" alt="{esc(a)}"></div>' for i,a in imgs)+'</div>'

FAQ=[("Why choose Your Fave Photobooth over other Photo Experience companies?","We know your event isn't “just another booking.” It's a day you've invested time, energy, and countless details into. That's why we prioritize vision, result, preparation, reliability, and a seamless experience from start to finish.\n\nWhen you book with Your Fave Photobooth, you're choosing a team that treats your event with the same care and attention as if it were our own."),
 ("What types of events do you provide Photo Experiences for?","We provide luxury Photo Experiences for weddings, corporate events, brand activations, galas, private parties, birthdays, and more. Based in the DMV, we proudly serve Washington, DC, Maryland, Virginia, and destination events."),
 ("Can the Photo Experience be customized for my event or brand?","Absolutely! We offer a variety of customization options, including branded booth shell, backdrop, photo print, start screens, color scheme, and a lot more.\n\nWhatever your event type, we'll tailor the experience to match your vision."),
 ("Can your Photo Experience be set up outdoors?","Yes! Our Photo Experiences can be set up outdoors with overhead coverage, a level surface, and access to a standard power outlet. All outdoor setups are approved based on venue conditions and weather to ensure the best guest experience and protect our equipment."),
 ("What is the difference between the DSLR and Portrait Photo Experiences?","Our Classic DSLR Photo Experience is a self-service experience with instant digital photos and professional image quality. On-site attendance can be requested for this product, but may not be necessary depending on your type of event.\n\nOur Portrait Photo Experience includes a professional photographer who captures studio-quality portraits and provides beautifully edited prints on-site. The photographer poses the guests, giving them a real photoshoot experience at the event.\n\nChoose the DSLR Booth for interactive fun, or the Portrait Booth for a luxury photography experience."),
 ("How far in advance should I book my Photo Experience?","We recommend booking as early as possible, especially for weddings, corporate events, and peak event seasons. Popular dates can book several months in advance, so reserving early ensures your preferred booth experience is available."),
 ("How much space do you need?","Our premium backdrops typically require an 8′ × 8′ to 10′ × 10′ setup area with at least 8–10 feet of overhead clearance. This gives guests enough room to pose naturally while ensuring the best photo quality. Larger custom backdrops or installations may require additional space."),
 ("How long does setup take?","Our team typically arrives one to two hours before your event begins to complete setup, testing, and ensure everything is ready before guests arrive."),
 ("Where is the best place to set up a Photo Experience?","For the best experience, place the booth in a high-traffic area, such as near the bar, dance floor, or main guest pathway. A visible location encourages more participation and keeps the booth busy throughout your event."),
 ("Are you insured?","Yes. We are fully insured and can provide a Certificate of Insurance (COI) upon request. We can also add your venue as an additional insured if required.")]
ARROW='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
def intro(title, body):
    return f'<section class="wrap intro"><h2 class="intro__t reveal">{title}</h2><p class="intro__p reveal">{body}</p></section>'
def pair(a, b):
    return (f'<section class="wrap pair"><div class="pair__a reveal"><img src="/assets/photos/{a[0]}" alt="{esc(a[1])}" loading="lazy"></div>'
            f'<div class="pair__b reveal"><img src="/assets/photos/{b[0]}" alt="{esc(b[1])}" loading="lazy"></div></section>')
def incl(title, items, sub='', cols=4):
    cards=''.join(f'<article class="incl__c reveal"><div class="incl__ph"><img src="/assets/photos/{i}" alt="{esc(a)}" loading="lazy"></div><h3>{h}</h3><p>{p}</p></article>' for i,a,h,p in items)
    s=f'<p class="sec__sub reveal">{sub}</p>' if sub else ''
    return f'<section class="wrap sec"><h2 class="sec__h reveal">{title}</h2>{s}<div class="incl incl--{cols}">{cards}</div></section>'
def types(title, items):
    cards=''.join(f'<a class="types__c reveal" href="{h}"><div class="types__ph"><img src="/assets/photos/{i}" alt="{esc(a)}" loading="lazy"></div><h3>{t}</h3><p>{p}</p><span class="types__go">{g} {ARROW}</span></a>' for h,i,a,t,p,g in items)
    return f'<section class="wrap sec"><h2 class="sec__h reveal">{title}</h2><div class="types">{cards}</div></section>'
def quote(q, who):
    return f'<section class="wrap quote reveal"><blockquote><p>“{q}”</p><footer>{who}</footer></blockquote></section>'
def faqs(title, picks):
    d=dict(FAQ)
    items=''.join(f'<div class="acc__item reveal"><button class="acc__q" type="button" aria-expanded="false"><span>{esc(q)}</span><i>+</i></button><div class="acc__a" hidden>{esc(d[q])}</div></div>' for q in picks)
    return f'<section class="wrap sec"><h2 class="sec__h reveal">{title}</h2><div class="acc">{items}</div><p class="faqs__more reveal"><a href="/faq/">See all questions {ARROW}</a></p></section>'

P={}
# Photo Experiences
P['photobooths']=page('Guest Centered Photo Experiences: Portrait & DSLR | Your Fave Photobooth',
 'Compare our Portrait Booth (investment starting at $1,500 for 3 hours) and Classic DSLR Photobooth (investment starting at $650 for a full day). Serving MD, DC & VA.','/photobooths/',
 hero('Explore Our <em>Guest Centered Photo Experiences</em>','Premium, fully customizable Photo Experiences for weddings, corporate events and parties.','photobooths-hero.jpg','Guests posing at the Portrait Photo Experience',[('/contact/','Check availability','pill--navy'),('/faq/','Read the FAQ','pill--line')]) if False else
 hero('Explore Our <em>Guest Centered Photo Experiences</em>','Premium, fully customizable Photo Experiences for weddings, corporate events and parties.','hd/portrait.jpg','Guests posing at the Portrait Photo Experience',[('/contact/','Check availability','pill--navy'),('/faq/','Read the FAQ','pill--line')])+
 sec('Our <em>Experiences</em>', exp([
  ('/contact/','hd/portrait.jpg','Portrait Booth','Portrait','Booth','A live professional photographer, studio-style portraits and unlimited prints.','$1,500','3 hours'),
  ('/contact/','dslr.jpg','Classic DSLR Photobooth','Classic','DSLR','Our signature booth, with instant photos everyone shares.','$650','Full day')]))+
 f'<section class="wrap strip reveal"><p>Maryland, DC &amp; Virginia, <em>and wherever you celebrate.</em></p></section>'+
 cta('Not sure which? <em>Let us help.</em>','Book a consultation'))

# Events
P['events']=page('Event Photo Experiences: Corporate, Birthdays, Galas | Your Fave Photobooth',
 'Portrait and DSLR photo experiences for corporate events, birthdays, anniversaries, galas and private parties in Maryland, Washington DC and Virginia. Studio lighting, a host and photos in minutes.','/events/',
 hero('Photo Experiences <em>For Every Kind Of Event</em>','From milestone birthdays to company galas, we bring a lit portrait set, a friendly host and photos in minutes, so every guest leaves with something worth keeping.','hd/women.jpg','Two guests laughing together at a Photo Experience',[('/contact/','Check your date','pill--navy'),('/photobooths/','See experiences','pill--line')])+
 intro('The lighting of a studio. <em>The ease of a booth.</em>','Most guests have never had a professionally lit portrait taken at a party. We build a styled set inside your venue, in a space of roughly 8 by 8 to 10 by 10 feet, and guide each guest through the shot. That is what a Guest Centered Photo Experience means to us.')+
 pair(('hd/hero2.jpg','A portrait set in a ballroom with a backdrop, lights and gold stanchions'),('hd/portrait.jpg','A group of guests in bright outfits posing together at a Photo Experience'))+
 incl('Every event <em>includes</em>',[
  ('dslr.jpg','A booth with a ring light and an umbrella light at an evening event','Studio lighting and backdrop','Flattering light and a backdrop chosen for your event, set up and tested one to two hours before guests arrive.'),
  ('wedding-lg.jpg','Four guests posing close together in black and white','Guidance for every guest','Our team helps guests with poses and groups, so nobody has to work out the camera and the line keeps moving.'),
  ('umbrella.jpg','A guest reaching toward the screen of a white booth','Photos in minutes','Prints or digital copies, depending on the experience, ready while the event is still going.'),
  ('corporate.jpg','A guest in a cap holding a drink in front of a branded backdrop','Your look on every photo','Custom print templates, start screens and backdrops, matched to your theme, colors or brand.')])+
 types('Events <em>we cover</em>',[
  ('/corporate/','corporate-guest.webp','A guest in a rust dress posing at a branded backdrop','Corporate events','Holiday parties, conferences and client nights, with your branding on every photo.','Learn more'),
  ('/weddings/','couple-bw.jpg','A couple posing together in black and white','Weddings','A portrait station guests visit between the toasts and the dance floor.','Learn more'),
  ('/corporate/','hd/booth-red-lg.jpg','A red branded booth at a brand activation','Brand activations','Branded booths and instant sharing that put your launch in front of more people.','Learn more'),
  ('/contact/','hd/hero3.jpg','A guest posing with a blue feather fan','Birthdays','Milestone birthdays deserve photos as good as the outfits.','Check your date'),
  ('/contact/','anniversary.jpg','A couple in red traditional attire sharing a kiss','Anniversaries','Portraits for the two of you, and for everyone who came to celebrate.','Check your date'),
  ('/contact/','hd/hero1.jpg','A guest in a flowing gown posing among white flowers in black and white','Galas and private parties','Formal nights and cultural celebrations, styled to match your theme.','Check your date')])+
 quote("Truly the highlight of our event! Our guests couldn't stop talking about it!",'Yinka Meji')+
 faqs('Event <em>questions</em>',['What types of events do you provide Photo Experiences for?','How much space do you need?','Where is the best place to set up a Photo Experience?','Can your Photo Experience be set up outdoors?'])+
 cta('Event not listed? <em>Tell us about it.</em>','Get in touch'))

# Corporate
P['corporate']=page('Corporate & Brand Activation Photo Experiences in DC | Your Fave Photobooth',
 'Branded photo experiences for corporate events and brand activations in Washington DC, Maryland and Virginia. Custom backdrops, overlays, start screens and instant sharing.','/corporate/',
 hero('Branded Photo Experiences <em>For Corporate Events</em>','A Guest Centered Photo Experience that turns every guest moment into shareable content for your brand, at launches, conferences and client events.','hd/booth-red-lg.jpg','A red branded booth at a brand activation',[('/contact/','Hire us','pill--navy'),('/photobooths/','See experiences','pill--line')])+
 intro('Your brand, <em>in every guest&rsquo;s camera roll.</em>','Branded backdrops, overlays and start screens put your identity on every photo. Guests share their photos on the spot, so your event keeps reaching people after the doors close.')+
 pair(('booth-red.jpg','A guest sipping a drink in front of a branded backdrop'),('corporate.jpg','A guest in a cap holding a drink in front of a branded backdrop'))+
 incl('What your <em>activation gets</em>',[
  ('booth-white.jpg','A white booth set up in a bright room, with a guest beside it','Branded from screen to print','Backdrops, overlays, templates and start screens built around your brand guidelines.'),
  ('umbrella.jpg','A guest reaching toward the screen of a white booth','Instant sharing','Guests send their photos to their own phones in seconds, ready to post.'),
  ('corporate-guest.webp','A guest in a rust dress posing at a branded backdrop','A team that represents you','Hosts trained to welcome your guests and keep things moving, not just run equipment.'),
  ('hd/women.jpg','Two guests laughing together at a Photo Experience','Guests who stay longer','A reason for attendees to stop, interact with your brand and leave with something they want to keep.')])+
 sec('Signature <em>experiences</em>', exp([
  ('/contact/','hd/portrait.jpg','Portrait Booth','Portrait','Booth','A portrait lounge made for your brand.','$1,500','3 hours'),
  ('/contact/','dslr.jpg','Classic DSLR Photobooth','Classic','DSLR','Your brand, shared all event long.','$650','Full day')]))+
 quote('The guests truly loved the experience. They are extremely professional and handle their work with care.','Omoniola Paye')+
 faqs('Corporate <em>questions</em>',['Can the Photo Experience be customized for my event or brand?','Are you insured?','How long does setup take?','How much space do you need?'])+
 cta('The ultimate <em>brand experience.</em>','Hire us'))

# Weddings
P['weddings']=page('Wedding Portrait Booth in Maryland, DC & VA | Your Fave Photobooth',
 'A wedding portrait booth with a live photographer, premium backdrop and unlimited prints for your guests. Serving weddings in Maryland, Washington DC and Virginia.','/weddings/',
 hero('A Portrait Studio <em>At Your Reception</em>','Between the toasts and the dance floor, your guests step onto a lit set, get posed by our photographer, and leave with prints made that night.','hd/wedding-lg.jpg','Four wedding guests posing together in black and white',[('/contact/','Check date availability','pill--navy'),('/photobooths/','See experiences','pill--line')])+
 intro('Your photographer covers the two of you. <em>We cover your guests.</em>','Your wedding photographer is focused on the couple. We give every guest their own moment in front of the camera, with a Guest Centered Photo Experience that feels like a portrait session, not a queue.')+
 pair(('hd/home-mobile.jpg','A bride and groom smiling together in black and white'),('hd/hero1.jpg','A guest in a flowing gown posing among white flowers in black and white'))+
 incl('What your guests <em>experience</em>',[
  ('hd/home-hero-2.jpg','A bride and groom in a black and white portrait','A live portrait photographer','A professional who poses each guest and group, so the photos look like a portrait session.'),
  ('hd/hero2.jpg','A portrait set in a ballroom with a backdrop, lights and gold stanchions','A set that matches your day','A premium backdrop, stanchions and a photo rug, styled to sit beautifully in your venue.'),
  ('hd/hero3.jpg','A guest posing with a blue feather fan','Unlimited prints','Every guest can take home a print from the night, as many as they like.'),
  ('booth-white.jpg','A bride standing beside a white booth in a bright room','A digital gallery','Every portrait in one gallery, ready for you to revisit and share after the wedding.')])+
 sec('See our <em>featured gallery</em>', mq([('teal.jpg','Wedding guest in a teal gele'),('anniversary.jpg','A couple in red traditional attire sharing a kiss'),('couple-bw.jpg','A couple posing together in black and white'),('wedding.jpg','A groom kissing his partner on the cheek'),('green.jpg','Wedding guest in a green gele'),('red-dress.jpg','Wedding guest in a red dress'),('wedding-lg.jpg','Four wedding guests posing together in black and white')]))+
 quote('The Black and White Portrait Photo Experience would be a hit at our wedding.','Famata &amp; Amos')+
 sec('Signature <em>experiences</em>', exp([
  ('/contact/','hd/portrait.jpg','Portrait Booth','Portrait','Booth','A portrait lounge for your wedding day.','$1,500','3 hours'),
  ('/contact/','dslr.jpg','Classic DSLR Photobooth','Classic','DSLR','Laughter and photos all night long.','$650','Full day')]))+
 faqs('Wedding <em>questions</em>',['How far in advance should I book my Photo Experience?','How much space do you need?','How long does setup take?','What is the difference between the DSLR and Portrait Photo Experiences?'])+
 cta('An evening worth remembering <em>in every detail.</em>','Check date availability'))

# FAQ
acc=''.join(f'''  <div class="acc__item reveal"><button class="acc__q" type="button" aria-expanded="false"><span>{esc(q)}</span><i>+</i></button><div class="acc__a" hidden>{esc(a)}</div></div>\n''' for q,a in FAQ)
P['faq']=page('Photo Experience FAQs & Guide | Your Fave Photobooth',
 'Answers to common Photo Experience questions: customization, space, setup time, outdoor events, Portrait vs DSLR booths and booking lead time.','/faq/',
 hero('Frequently <em>Asked</em>','Everything to know before you book.','hd/hero1.jpg','Black and white portrait at the Photo Experience',[('/contact/','Ask us directly','pill--navy')])+
 f'''
<section class="wrap sec" style="padding-top:40px"><div class="acc">
{acc}</div></section>'''+cta('Still wondering? <em>Just ask.</em>','Ask us directly'))

# Contact
P['contact']=page_bare('Book a Photo Experience | Contact Your Fave Photobooth | MD, DC & VA',
 'Check availability and request a quote for your Photo Experience in Maryland, Washington DC or Virginia.','/contact/',
 hero('We Want To <em>Hear From You</em>', "Tell us about your event and we'll get back to you.", 'hd/hero3.jpg', 'Black and white portrait Photo Experience session', [])+
 f'''<section class="wrap sec" style="padding-top:20px"><div class="form reveal"><div id="hq-form-n2dp36et"></div><script src="https://crm.madulab.com/embed.js" data-form="n2dp36et" async></script></div></section>''',)

# Thank you
P['thankyou']=page_bare('Thank You, Inquiry Received | Your Fave Photobooth',
 'Thank you for your Photo Experience inquiry. We will email you shortly to schedule your complimentary consultation.','/thankyou/',
 f'''<section class="ty1">
<div class="ty1__main">
 <h1>Your Inquiry Has Been <em>Received.</em></h1>
 <p>We'll email you shortly to schedule your complimentary consultation.</p>
 <p>No email in 20 minutes? Please check your spam folder.</p>
 <a class="pill pill--navy" href="/">Back to home</a>
 <div class="ty1__rev"><div class="qz" data-qz><div class="rev__qs"><figure class="rev__q is-on"><p>“The guests truly loved the experience. They are extremely professional and handle their work with care.”</p><figcaption class="rev__who">Omoniola Paye</figcaption></figure><figure class="rev__q"><p>“Truly the highlight of our event! Our guests couldn't stop talking about it!”</p><figcaption class="rev__who">Yinka Meji</figcaption></figure><figure class="rev__q"><p>“The Black and White Portrait Photo Experience would be a hit at our wedding.”</p><figcaption class="rev__who">Famata &amp; Amos</figcaption></figure></div><div class="qz__nav"><button class="qz__btn" type="button" data-prev aria-label="Previous review">&#8592;</button><div class="dots"><i role="button" tabindex="0" aria-label="Review 1" class="on"></i><i role="button" tabindex="0" aria-label="Review 2"></i><i role="button" tabindex="0" aria-label="Review 3"></i></div><button class="qz__btn" type="button" data-next aria-label="Next review">&#8594;</button></div></div></div>
</div>
<div class="ty1__foot">© Your Fave Photobooth, serving Maryland, Washington DC and Virginia</div></section>''',noindex=True)

# Digital photos
P['dp']=page('Get Your Digital Photos | Your Fave Photobooth','Enter your name and email to receive your digital photos from Your Fave Photobooth.','/dp/',
 '''<section class="wrap ty" style="padding-top:150px"><h1 class="reveal">Get Your <em>Digital Photos</em></h1><div class="form reveal" style="margin-top:40px"><iframe src="https://api.leadconnectorhq.com/widget/form/AfVf4OaJUumOB8Kzcc2G" style="height:434px" title="Event Photo Request Form"></iframe></div></section>''',noindex=True,chr_=True,ft=False)

# Connect (links)
def linkpage(title, desc, path, h1, items):
    icons={'Write a Google review':'/assets/icon-google.svg','Follow on Instagram':'/assets/icon-instagram.svg','Visit our website':'/assets/logo-blue.png'}
    rows=''.join(f'<a href="{h}"{" target=_blank rel=noopener" if ext else ""} class="{c}"><span class="lk__t">'+(f'<span class="lk__ic"><img src="{icons[t]}" alt=""></span>' if t in icons else '')+f'{t}</span><span>→</span></a>' for h,t,c,ext in items)
    body=f'''<section class="lk"><img class="lk__bg" src="/assets/photos/hd/anniversary.jpg" alt=""><div class="lk__tint"></div><div class="lk__in reveal"><img class="logo" src="/assets/logo-white.png" alt="Your Fave Photobooth"><h1>{h1}</h1><div class="lk__list">{rows}</div></div></section>'''
    return page(title,desc,path,body,noindex=True,chr_=False,ft=False)
P['connect']=linkpage('Connect with Your Fave Photobooth | MD, DC & VA','Quick links: weddings, corporate events, brand activations and date availability.','/connect/',
 '#1 Portrait Booth Company In <em>Maryland, DC &amp; Virginia</em>',
 [('/','Visit our website',"",False),('/weddings/','Weddings',"",False),('/corporate/','Corporate events',"",False),('/corporate/','Brand activations',"",False),('/contact/','Check event date availability','is-solid',False)])
P['connect2']=linkpage('Your Fave Photobooth: Review, Instagram & Website','Leave us a Google review, follow us on Instagram, or visit our website.','/connect2/',
 'Thank you for <em>choosing us</em>',
 [('https://g.page/r/CSPvKcJOUbIEEBM/review','Write a Google review',"",True),('https://www.instagram.com/YOURFAVEPHOTOBOOTH','Follow on Instagram',"is-solid",True),('https://yourfavephotobooth.com','Visit our website',"",True)])

# 404
P['404']=page('Page Not Found | Your Fave Photobooth','The page you were looking for could not be found.','/404.html',
 hero('Page Not <em>Found</em>', 'This page has moved.', 'hd/teal.jpg', 'Guest portrait at an event Photo Experience', [('/', 'Back to home', 'pill--navy')]),noindex=True)

# Home (checkpoint)
home=open(OUT+'/source/index-v3.html').read()
import re
P['home']=(home
 .replace('<!--HOME-WHAT-->', split('hd/hero2.jpg','A portrait set in a ballroom with a backdrop, lights and gold stanchions','What happens <em>at the booth</em>',
   '',
   ['We set up the lighting and backdrop one to two hours before guests arrive.','On the Portrait Booth, a live photographer directs every pose.','Guests get prints or digital copies in minutes, depending on the experience.','You receive a gallery of the night to keep and share.']))
 .replace('<!--HOME-FAQ-->', faqs('Good to <em>know</em>',['What is the difference between the DSLR and Portrait Photo Experiences?','Can the Photo Experience be customized for my event or brand?','How far in advance should I book my Photo Experience?','Are you insured?'])))
paths={'home':'/index.html','photobooths':'/photobooths/index.html','events':'/events/index.html','corporate':'/corporate/index.html','weddings':'/weddings/index.html','faq':'/faq/index.html','contact':'/contact/index.html','thankyou':'/thankyou/index.html','dp':'/dp/index.html','connect':'/connect/index.html','connect2':'/connect2/index.html','404':'/404.html'}
for k,rel in paths.items():
    out=OUT+rel; os.makedirs(os.path.dirname(out),exist_ok=True)
    open(out,'w').write(P[k]); print('wrote',rel,len(P[k]))
