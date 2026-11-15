import math, os
OUT='/home/claude/vital-sync/public/assets/guides/'
INK='#27324d'; SKIN='#f3d9c6'; SKIN2='#e9c6ae'; SUIT='#cfdcf0'; DEV='#eef2f8'; BLUE='#0b3d91'; RED='#c62828'; GRN='#12784a'; GREY='#55607a'; CUFF='#8fa9d6'
def head(title, w=720, h=460):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">
<title>{title}</title>
<defs><marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="{BLUE}"/></marker>
<marker id="ag" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="{GREY}"/></marker>
<marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="{RED}"/></marker></defs>
<rect width="{w}" height="{h}" fill="#ffffff"/>
<text x="24" y="34" font-size="19" font-weight="700" fill="{BLUE}">{title}</text>
'''
def limb(x1,y1,x2,y2,w,fill,cap='round',ow=2):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{INK}" stroke-width="{w+2*ow}" stroke-linecap="{cap}"/><line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{fill}" stroke-width="{w}" stroke-linecap="{cap}"/>'
def num(x,y,n): return f'<circle cx="{x}" cy="{y}" r="12" fill="{BLUE}"/><text x="{x}" y="{y+5}" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">{n}</text>'
def lead(x1,y1,x2,y2,c=BLUE): return f'<path d="M{x1} {y1}L{x2} {y2}" stroke="{c}" stroke-width="1.5" fill="none"/><circle cx="{x2}" cy="{y2}" r="3.5" fill="{c}"/>'
def lab(x,y,lines,n=None,anchor='start',c=INK,size=14,bold_first=True):
    out=''
    if n is not None:
        nx = x-18 if anchor=='start' else x+18
        out+=num(nx,y-5,n)
    for k,t in enumerate(lines):
        fw='700' if (k==0 and bold_first) else '400'; col=c if k==0 else GREY
        out+=f'<text x="{x}" y="{y+k*18}" font-size="{size if k==0 else size-1}" font-weight="{fw}" fill="{col}" text-anchor="{anchor}">{t}</text>'
    return out
def foot(t): return f'<text x="24" y="444" font-size="12.5" fill="{GREY}">{t}</text>'
def save(name, s): open(OUT+name,'w').write(s+'</svg>\n')

# ---------- 1 Blood pressure ----------
s=head('Blood pressure: posture and cuff placement')
# floor, chair, table
s+=f'<path d="M40 401H470" stroke="#9aa6bd" stroke-width="2"/>'
s+=f'<rect x="92" y="140" width="16" height="200" rx="4" fill="#e3e8f0" stroke="{INK}" stroke-width="2"/><rect x="92" y="300" width="176" height="14" rx="4" fill="#e3e8f0" stroke="{INK}" stroke-width="2"/><path d="M104 314V400M256 314V400" stroke="{INK}" stroke-width="3"/>'
s+=f'<rect x="200" y="246" width="232" height="10" rx="2" fill="#e3e8f0" stroke="{INK}" stroke-width="2"/><rect x="412" y="256" width="10" height="145" fill="#e3e8f0" stroke="{INK}" stroke-width="2"/>'
# legs
s+=limb(250,286,252,392,24,SUIT)
s+=f'<path d="M234 389H286Q298 389 298 397V401H234Z" fill="{INK}"/>'
s+=f'<path d="M116 266H246Q264 268 264 284Q264 300 246 300H124Q112 298 112 283Z" fill="{SUIT}" stroke="{INK}" stroke-width="2"/>'
# torso
s+=f'<path d="M120 148Q124 142 138 142H170Q190 148 194 176L198 248Q199 282 188 296L124 298Q112 296 112 282V166Q112 152 120 148Z" fill="{SUIT}" stroke="{INK}" stroke-width="2"/>'
# heart
s+=f'<path d="M142 207c-6-5-12-9-12-14a6 6 0 0 1 12-2a6 6 0 0 1 12 2c0 5-6 9-12 14z" fill="{RED}" opacity=".85"/>'
s+=f'<path d="M118 200H236" stroke="{RED}" stroke-width="1.5" stroke-dasharray="5 4"/><text x="240" y="196" font-size="12" fill="{RED}">heart level</text>'
# arm: upper (skin), forearm, hand
s+=limb(168,166,206,234,24,SKIN)
s+=limb(206,234,318,236,21,SKIN)
s+=limb(318,236,348,238,18,SKIN)
s+=f'<path d="M323 228q10-12 22-8" stroke="{INK}" stroke-width="2" fill="none"/>'
# short sleeve over shoulder
s+=f'<path d="M150 150Q170 146 182 164L170 178Q158 176 150 168Z" fill="{SUIT}" stroke="{INK}" stroke-width="2"/>'
# cuff on upper arm
s+=limb(176.5,181.3,196.2,216.6,34,CUFF,'butt')
s+=f'<path d="M197 216C228 246 300 240 360 230" stroke="{INK}" stroke-width="3" fill="none"/>'
s+=f'<rect x="356" y="196" width="62" height="50" rx="7" fill="{DEV}" stroke="{INK}" stroke-width="2"/><rect x="363" y="203" width="48" height="24" rx="3" fill="{BLUE}"/><text x="387" y="220" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">118/76</text><circle cx="387" cy="237" r="4" fill="{INK}"/>'
# neck and head
s+=f'<rect x="139" y="128" width="20" height="18" fill="{SKIN}" stroke="{INK}" stroke-width="2"/>'
s+=f'<circle cx="150" cy="104" r="30" fill="{SKIN}" stroke="{INK}" stroke-width="2"/><path d="M179 98l9 12-9 3" fill="{SKIN}" stroke="{INK}" stroke-width="2" stroke-linejoin="round"/><circle cx="167" cy="98" r="2.5" fill="{INK}"/><path d="M122 96Q128 70 158 72Q176 74 180 88Q160 80 140 88Q130 92 128 104Z" fill="#5a4636"/><ellipse cx="146" cy="108" rx="5" ry="8" fill="{SKIN2}" stroke="{INK}" stroke-width="1.5"/><path d="M168 118q6 2 10-1" stroke="{INK}" stroke-width="1.5" fill="none"/>'
# callouts
s+=num(48,172,1)+f'<text x="48" y="200" font-size="13" font-weight="700" fill="{INK}" text-anchor="middle">Back</text><text x="48" y="216" font-size="13" font-weight="700" fill="{INK}" text-anchor="middle">supported</text><text x="48" y="234" font-size="12" fill="{GREY}" text-anchor="middle">no talking</text>'
s+=lab(236,148,['Cuff at heart level','on the bare upper arm'],2)+lead(234,160,198,196)
s+=lab(290,300,['Arm supported','palm up, strapped'],3)+lead(288,286,286,246)
s+=lab(306,352,['Feet flat','legs uncrossed'],4)+lead(294,362,292,388)
# inset
s+=f'<rect x="452" y="54" width="252" height="370" rx="14" fill="#f6f8fc" stroke="#d5ddeb" stroke-width="1.5"/><text x="468" y="80" font-size="14" font-weight="700" fill="{BLUE}">Close-up: inner upper arm</text>'
s+=f'<path d="M462 188H612Q622 196 640 194H704V274H640Q622 270 612 278H462Z" fill="{SKIN}" stroke="{INK}" stroke-width="2"/>'
s+=f'<path d="M462 214C520 218 580 226 614 236C640 244 670 246 704 248" stroke="{RED}" stroke-width="4" fill="none"/>'
s+=f'<path d="M614 200q-8 36 0 72" stroke="{INK}" stroke-width="1.6" fill="none" stroke-dasharray="3 3"/>'
s+=f'<rect x="472" y="180" width="102" height="104" rx="6" fill="{CUFF}" stroke="{INK}" stroke-width="2" opacity=".96"/><path d="M472 196H574M472 268H574" stroke="#6d89bd" stroke-width="1.5"/>'
s+=f'<rect x="499" y="200" width="48" height="16" rx="3" fill="#fff" stroke="{INK}" stroke-width="1"/><text x="523" y="212" font-size="9.5" font-weight="700" fill="{INK}" text-anchor="middle">ARTERY</text><path d="M523 219l-8 10h16z" fill="{RED}"/>'
s+=f'<path d="M574 286V306M614 286V306" stroke="{GREY}" stroke-width="1.2"/><path d="M578 300H610" stroke="{GREY}" stroke-width="1.5" marker-start="url(#ag)" marker-end="url(#ag)"/><text x="594" y="322" font-size="13" font-weight="700" fill="{INK}" text-anchor="middle">2–3 cm</text>'
s+=f'<text x="688" y="150" font-size="12" fill="{RED}" font-weight="700" text-anchor="end">brachial artery</text>'+lead(660,156,662,244,RED)
s+=f'<text x="630" y="300" font-size="12" fill="{GREY}">elbow crease</text>'
s+=f'<text x="466" y="300" font-size="11" fill="{GREY}">← shoulder</text>'
s+=f'<text x="468" y="352" font-size="13" fill="{INK}"><tspan font-weight="700">5</tspan>  Lower edge 2–3 cm above crease</text><text x="468" y="374" font-size="13" fill="{INK}"><tspan font-weight="700">6</tspan>  Marker over the brachial artery</text><text x="468" y="396" font-size="13" fill="{INK}"><tspan font-weight="700">7</tspan>  Snug: two fingertips fit under</text>'
s+=foot('Posture and cuff position follow American Heart Association guidance on blood pressure measurement.')
save('bp-cuff-guide.svg', s)

# ---------- 2 Radial pulse ----------
s=head('Radial pulse: finger placement')

# fingers of the measured hand (palm up, thumb side at top)
for (y,l,w) in [(214,128,22),(241,140,23),(267,128,22),(291,100,20)]:
    s+=limb(548,y,548+l,y,w,SKIN)
s+=limb(452,206,522,140,30,SKIN)
s+=limb(-40,250,392,252,108,SKIN)+f'<path d="M-4 194H40V308H-4Z" fill="{SUIT}" stroke="{INK}" stroke-width="2"/>'
s+=f'<path d="M392 198Q404 192 424 194L544 200Q560 204 560 220V290Q560 306 544 308L424 312Q398 312 392 302Z" fill="{SKIN}" stroke="{INK}" stroke-width="2"/>'
s+=f'<path d="M393 200V303" stroke="{SKIN}" stroke-width="5"/>'
s+=f'<path d="M404 206q-6 46 0 92M414 208q-5 44 0 88" stroke="{SKIN2}" stroke-width="2" fill="none"/><path d="M450 214q20 40 4 90M480 240q30 4 66 0M482 270q30 4 64 2" stroke="{SKIN2}" stroke-width="2" fill="none"/>'
# radial artery
s+=f'<path d="M44 228C200 222 300 216 392 214C420 212 438 210 452 204" stroke="{RED}" stroke-width="4" fill="none"/>'
s+=f'<circle cx="362" cy="215" r="9" fill="none" stroke="{RED}" stroke-width="2" opacity=".7"/><circle cx="362" cy="215" r="17" fill="none" stroke="{RED}" stroke-width="1.5" opacity=".35"/>'
# examiner fingers from upper left
s+=f'<path d="M440 -10L560 -10L520 40L452 52Z" fill="{SUIT}" stroke="{INK}" stroke-width="2"/>'
s+=limb(424,84,350,200,26,SKIN2)
s+=limb(452,86,378,198,26,SKIN2)
s+=f'<ellipse cx="357" cy="188" rx="8" ry="11" transform="rotate(33 357 188)" fill="#f7e7dc" stroke="{INK}" stroke-width="1.4"/><ellipse cx="385" cy="186" rx="8" ry="11" transform="rotate(33 385 186)" fill="#f7e7dc" stroke="{INK}" stroke-width="1.4"/>'
s+=f'<path d="M408 30Q430 20 470 24L520 34Q530 52 512 70L476 96Q440 104 412 92Q398 70 408 30Z" fill="{SKIN2}" stroke="{INK}" stroke-width="2"/><path d="M486 86q14-4 20-16M496 92q14-2 22-14" stroke="{INK}" stroke-width="1.6" fill="none"/>'
s+=lab(42,112,['Index and middle fingertips','press lightly; not your thumb'],1)+lead(254,108,352,190)
s+=lab(42,186,['Radial artery'],2,c=RED)+lead(140,194,220,222,RED)
s+=lab(590,132,['Thumb side'],3)+lead(586,140,536,140)
s+=lab(300,360,['Just above the wrist crease','on the thumb side of the inner wrist'],4)+lead(330,342,368,226)
s+=f'<text x="420" y="360" font-size="13" fill="{GREY}"> </text>'
s+=foot('Your thumb has its own pulse and can mislead the count. Count for the full 60 seconds, tapping once per beat.')
save('pulse-wrist-guide.svg', s)

# ---------- 3 Pulse oximeter ----------
s=head('Pulse oximeter: finger position')
s+=f'<path d="M20 330H480" stroke="#9aa6bd" stroke-width="2"/>'
# hand side view: forearm, back of hand, curled fingers, extended index
s+=f'<path d="M-4 268L72 258Q120 246 196 240L400 236Q418 236 420 250Q418 264 400 266L250 268Q262 290 246 312Q230 328 196 326L120 322Q90 326 72 314L-4 312Z" fill="{SKIN}" stroke="{INK}" stroke-width="2"/>'
s+=f'<path d="M150 270q50 6 100 0M150 296q50 6 94 2M150 316q40 4 70 2" stroke="{SKIN2}" stroke-width="2" fill="none"/><path d="M250 268Q262 290 246 312" stroke="{INK}" stroke-width="2" fill="none"/>'
s+=f'<path d="M60 312Q70 326 90 328" stroke="{INK}" stroke-width="2" fill="none"/>'
s+=f'<path d="M-4 258H40V322H-4Z" fill="{SUIT}" stroke="{INK}" stroke-width="2"/>'
# nail
s+=f'<path d="M368 238Q390 232 410 238" stroke="{INK}" stroke-width="2" fill="#fbeee6"/>'
# device jaws (semi transparent)
s+=f'<rect x="292" y="196" width="150" height="40" rx="16" fill="{DEV}" stroke="{INK}" stroke-width="2" opacity=".93"/><rect x="292" y="266" width="150" height="34" rx="14" fill="{DEV}" stroke="{INK}" stroke-width="2" opacity=".93"/>'
s+=f'<path d="M296 236Q300 250 296 266M296 236" stroke="{INK}" stroke-width="2" fill="none"/>'
s+=f'<rect x="424" y="236" width="10" height="30" fill="#b9c4d6" stroke="{INK}" stroke-width="1.5"/><circle cx="452" cy="250" r="12" fill="{DEV}" stroke="{INK}" stroke-width="2"/>'
s+=f'<path d="M370 236h28M370 266h28" stroke="{RED}" stroke-width="5"/>'
s+=''.join(f'<path d="M{x} 241V261" stroke="{RED}" stroke-width="1.6" stroke-dasharray="3 3" opacity=".8"/>' for x in (374,384,394))
# display bubble
s+=f'<rect x="292" y="70" width="190" height="84" rx="10" fill="#0a1f44"/><text x="306" y="96" font-size="11" fill="#9cc3ff">SpO2 %</text><text x="306" y="132" font-size="34" font-weight="700" fill="#5fe0a3">98</text><text x="392" y="96" font-size="11" fill="#9cc3ff">PR bpm</text><text x="392" y="124" font-size="22" font-weight="700" fill="#ffc65c">72</text>'
s+=f'<path d="M392 142h10l4-8 5 14 4-10 3 4h12l4-8 5 14 4-10 3 4h12" stroke="#5fe0a3" stroke-width="2" fill="none"/>'
s+=f'<path d="M360 154L362 196" stroke="#0a1f44" stroke-width="2" stroke-dasharray="4 3"/>'
s+=lab(500,184,['Wait for a steady wave','about 20 seconds, then read'],5)+lead(498,188,482,140)
s+=lab(500,232,['Fingertip to the end stop'],1)+lead(498,236,432,250)
s+=lab(500,272,['Nail up, facing the light'],2)+lead(498,276,394,240)
s+=lab(40,372,['Hand still, resting at heart level','keep it warm; cold fingers read low'],3)+lead(150,368,150,316)
s+=lab(420,372,['No nail polish or false nails','they block the light'],4)+lead(418,368,400,240)
s+=foot('Red and infrared light passes through the fingertip; oxygen-rich and oxygen-poor blood absorb it differently.')
save('spo2-finger-guide.svg', s)

# ---------- 4 Temperature ----------
PROF='M60 20C110 0 165 20 170 70L172 80C174 88 168 92 170 96L186 122C188 126 184 130 178 130L176 136C182 140 182 146 176 148C182 152 180 158 174 160C172 170 176 178 168 186C160 196 140 198 130 192L128 230H70L72 190C40 180 20 130 24 90C26 50 40 28 60 20Z'
HAIR='M60 20C110 0 165 20 168 62C150 48 122 44 100 52C78 60 66 78 60 100C54 118 52 140 54 162C30 140 20 110 24 90C26 50 40 28 60 20Z'
EAR='M90 94C106 88 116 106 110 122C106 134 96 138 88 132C94 124 96 108 90 94Z'
def headfig(tx,ty,sc):
    return f'<g transform="translate({tx} {ty}) scale({sc})"><path d="{PROF}" fill="{SKIN}" stroke="{INK}" stroke-width="{2/sc}"/><path d="{HAIR}" fill="#5a4636"/><path d="{EAR}" fill="{SKIN2}" stroke="{INK}" stroke-width="{1.6/sc}"/><circle cx="96" cy="114" r="3" fill="{INK}"/><path d="M156 98q8-3 12 1" stroke="{INK}" stroke-width="{2/sc}" fill="none"/><path d="M152 90q10-6 18-2" stroke="#5a4636" stroke-width="{3/sc}" fill="none"/></g>'
s=head('Thermometer: forehead sweep or ear')
s+=f'<rect x="20" y="52" width="334" height="370" rx="14" fill="#f6f8fc" stroke="#d5ddeb"/><rect x="366" y="52" width="334" height="370" rx="14" fill="#f6f8fc" stroke="#d5ddeb"/>'
s+=f'<text x="36" y="80" font-size="15" font-weight="700" fill="{INK}">A  Forehead (temporal) sweep</text><text x="382" y="80" font-size="15" font-weight="700" fill="{INK}">B  Ear (tympanic)</text>'
sc=1.12; tx,ty=60,100
s+=headfig(tx,ty,sc)
P=lambda x,y:(tx+x*sc, ty+y*sc)
a=P(166,52); b=P(112,60)
s+=f'<path d="M{a[0]} {a[1]}Q{(a[0]+b[0])/2} {a[1]-26} {b[0]} {b[1]}" stroke="{BLUE}" stroke-width="3.5" fill="none" marker-end="url(#ar)"/>'
s+=f'<g transform="translate({a[0]+6} {a[1]-6}) rotate(-40)"><rect x="0" y="-11" width="96" height="22" rx="11" fill="{DEV}" stroke="{INK}" stroke-width="2"/><rect x="34" y="-6" width="30" height="12" rx="2" fill="{BLUE}"/><circle cx="4" cy="0" r="6" fill="#b9c4d6" stroke="{INK}" stroke-width="1.5"/></g>'
s+=lab(52,376,['Start mid-forehead, sweep to','the hairline at the temple; keep it flat'],1,bold_first=False).replace(f'fill="{INK}" text-anchor','fill="'+INK+'" text-anchor')
sc2=1.12; tx2,ty2=410,100
s+=headfig(tx2,ty2,sc2)
Q=lambda x,y:(tx2+x*sc2, ty2+y*sc2)
e1=Q(96,90); e2=Q(70,58)
s+=f'<path d="M{e1[0]} {e1[1]}L{e2[0]} {e2[1]}" stroke="{BLUE}" stroke-width="3.5" marker-end="url(#ar)"/>'
c=Q(96,114)
s+=f'<g transform="translate({c[0]} {c[1]}) rotate(118)"><path d="M0 -5L18 -9V9L0 5Z" fill="#b9c4d6" stroke="{INK}" stroke-width="1.5"/><rect x="18" y="-14" width="100" height="28" rx="12" fill="{DEV}" stroke="{INK}" stroke-width="2"/><rect x="58" y="-7" width="32" height="14" rx="2" fill="{BLUE}"/></g>'
s+=lab(416,370,['Pull the ear gently up and back'],2,bold_first=False)
s+=lab(416,398,['Aim the probe at the opposite eye'],3,bold_first=False)
s+=f''
s+=foot('Same thermometer, same site, every day. Hold still for the 30-second dwell or until it beeps.')
save('temp-ear-guide.svg', s)

# ---------- 5 Glucose ----------
s=head('Blood sugar: fingertip sample, step by step')
W=166
for k,t in enumerate(['Wash and dry','Lance the side','Wipe first drop','Touch the strip']):
    x=20+k*(W+8)
    s+=f'<rect x="{x}" y="52" width="{W}" height="360" rx="14" fill="#f6f8fc" stroke="#d5ddeb"/>'+num(x+24,78,k+1)+f'<text x="{x+42}" y="83" font-size="14" font-weight="700" fill="{INK}">{t}</text>'
def fingertip(cx, top, w=70, h=210):
    return f'<path d="M{cx-w/2} {top+h}V{top+w/2}A{w/2} {w/2} 0 0 1 {cx+w/2} {top+w/2}V{top+h}" fill="{SKIN}" stroke="{INK}" stroke-width="2"/><path d="M{cx-w/2+8} {top+w/2+70}q{w/2-8} 10 {w-16} 0M{cx-w/2+8} {top+w/2+110}q{w/2-8} 10 {w-16} 0" stroke="{SKIN2}" stroke-width="2" fill="none"/>'
# panel 1: hands under water drops
x=20
s+=f'<path d="M{x+60} 110h46v14h-10v10h-26v-10h-10z" fill="#b9c4d6" stroke="{INK}" stroke-width="2"/>'
for (dx,dy) in [(83,150),(72,172),(95,180),(83,198)]:
    s+=f'<path d="M{x+dx} {dy}c-5 7-7 10-7 13a7 7 0 0 0 14 0c0-3-2-6-7-13z" fill="#7fb2f0" stroke="{BLUE}" stroke-width="1.2"/>'
s+=fingertip(x+62,232,46,108)+fingertip(x+106,224,46,116)
s+=f'<text x="{x+14}" y="366" font-size="12.5" fill="{GREY}">Warm water helps</text><text x="{x+14}" y="382" font-size="12.5" fill="{GREY}">blood flow. Dry fully:</text><text x="{x+14}" y="398" font-size="12.5" fill="{GREY}">water dilutes the drop.</text>'
# panel 2: fingertip pad view with side targets
x=20+(W+8)
cx=x+W/2
s+=fingertip(cx,120)
s+=f'<path d="M{cx-35} 160A35 35 0 0 1 {cx-22} 128" stroke="{GRN}" stroke-width="9" fill="none" stroke-linecap="round" opacity=".85"/><path d="M{cx+35} 160A35 35 0 0 0 {cx+22} 128" stroke="{GRN}" stroke-width="9" fill="none" stroke-linecap="round" opacity=".85"/>'
s+=f'<ellipse cx="{cx}" cy="172" rx="16" ry="20" fill="none" stroke="{GREY}" stroke-width="1.5" stroke-dasharray="4 3"/><text x="{cx}" y="177" font-size="11" fill="{GREY}" text-anchor="middle">pad</text>'
s+=f'<g transform="translate({cx+34} 140) rotate(-35)"><rect x="6" y="-9" width="70" height="18" rx="8" fill="{DEV}" stroke="{INK}" stroke-width="2"/><rect x="0" y="-5" width="8" height="10" fill="#b9c4d6" stroke="{INK}" stroke-width="1.5"/></g>'
s+=f'<text x="{x+14}" y="364" font-size="12.5" font-weight="700" fill="{GRN}">Green: sides of the tip</text><text x="{x+14}" y="382" font-size="12.5" fill="{GREY}">Fewer nerve endings,</text><text x="{x+14}" y="398" font-size="12.5" fill="{GREY}">less painful than the pad.</text>'
# panel 3: wipe first drop
x=20+2*(W+8); cx=x+W/2
s+=fingertip(cx-10,130)
s+=f'<circle cx="{cx+28}" cy="150" r="8" fill="{RED}"/>'
s+=f'<g transform="translate({cx+44} 176) rotate(-20)"><rect x="0" y="0" width="54" height="44" rx="4" fill="#fff" stroke="{INK}" stroke-width="2"/><path d="M8 12h38M8 22h38M8 32h38" stroke="#d5ddeb" stroke-width="2"/><circle cx="14" cy="10" r="6" fill="{RED}" opacity=".6"/></g>'
s+=f'<path d="M{cx+40} 124q30 4 34 40" stroke="{BLUE}" stroke-width="2.5" fill="none" marker-end="url(#ar)"/>'
s+=f'<text x="{x+14}" y="382" font-size="12.5" fill="{GREY}">The first drop can hold</text><text x="{x+14}" y="398" font-size="12.5" fill="{GREY}">tissue fluid. Use the next.</text>'
# panel 4: strip edge
x=20+3*(W+8); cx=x+W/2
s+=f'<rect x="{x+80}" y="230" width="70" height="120" rx="12" fill="{DEV}" stroke="{INK}" stroke-width="2"/><rect x="{x+88}" y="244" width="54" height="38" rx="4" fill="#0a1f44"/><text x="{x+115}" y="270" font-size="18" font-weight="700" fill="#5fe0a3" text-anchor="middle">15</text><circle cx="{x+115}" cy="320" r="9" fill="#d5ddeb" stroke="{INK}" stroke-width="1.5"/>'
s+=f'<rect x="{x+60}" y="214" width="14" height="50" rx="2" fill="#f5e9b8" stroke="{INK}" stroke-width="1.5" transform="rotate(0)"/><rect x="{x+60}" y="262" width="34" height="0" />'
s+=f'<path d="M{x+67} 216V206" stroke="{RED}" stroke-width="3"/>'
s+=f'<g transform="translate({x+30} 112) rotate(-14)">'+fingertip(20,0,44,120).replace('fill="'+SKIN+'"','fill="'+SKIN+'"')+'</g>'
s+=f'<circle cx="{x+64}" cy="204" r="7" fill="{RED}"/>'
s+=f'<text x="{x+14}" y="366" font-size="12.5" fill="{GREY}">Touch the drop to the</text><text x="{x+14}" y="382" font-size="12.5" fill="{GREY}">strip edge. In microgravity</text><text x="{x+14}" y="398" font-size="12.5" fill="{GREY}">it will not drip; it clings.</text>'
s+=foot('Measure fasting: before your first meal and at least 8 hours after eating. Dispose of the lancet in the sharps container.')
save('glucose-lancet-guide.svg', s)

# ---------- 6 Respiratory ----------
s=head('Breathing rate: count rises, not effort')
# seated torso, hand on abdomen
s+=f'<rect x="54" y="120" width="14" height="230" rx="4" fill="#e3e8f0" stroke="{INK}" stroke-width="2"/>'
s+=f'<path d="M86 136Q90 130 104 130H140Q168 138 174 170L180 250Q181 286 170 300L90 302Q76 300 76 286V156Q76 140 86 136Z" fill="{SUIT}" stroke="{INK}" stroke-width="2"/>'
s+=f'<path d="M172 168Q192 200 188 250" stroke="{BLUE}" stroke-width="2" stroke-dasharray="5 4" fill="none"/>'
s+=f'<path d="M204 196V176M204 214V234" stroke="{BLUE}" stroke-width="2.5" marker-end="url(#ar)"/>'
s+=limb(132,150,150,228,22,SUIT)+limb(150,228,178,236,18,SKIN)
s+=f'<rect x="105" y="114" width="20" height="18" fill="{SKIN}" stroke="{INK}" stroke-width="2"/><circle cx="116" cy="90" r="30" fill="{SKIN}" stroke="{INK}" stroke-width="2"/><path d="M145 84l9 12-9 3" fill="{SKIN}" stroke="{INK}" stroke-width="2" stroke-linejoin="round"/><path d="M88 82Q94 56 124 58Q142 60 146 74Q126 66 106 74Q96 78 94 90Z" fill="#5a4636"/><path d="M128 84h8" stroke="{INK}" stroke-width="2"/>'
s+=lab(216,190,['rise'],None)+lab(216,238,['fall'],None)
s+=f'<text x="40" y="380" font-size="13" fill="{INK}"><tspan font-weight="700">Watch, don\'t steer.</tspan> Breathe naturally;</text><text x="40" y="398" font-size="13" fill="{GREY}">slowing down on purpose changes the count.</text>'
# waveform panel
X0,Y0,WW,HH=330,90,360,190
s+=f'<rect x="{X0-16}" y="{Y0-36}" width="{WW+32}" height="{HH+130}" rx="14" fill="#f6f8fc" stroke="#d5ddeb"/>'
s+=f'<text x="{X0}" y="{Y0-12}" font-size="14" font-weight="700" fill="{INK}">60-second count</text>'
pts=[]
n=14
for i in range(0,361):
    t=i/360*60; y=Y0+HH/2-50*math.sin(2*math.pi*t*n/60-math.pi/2)
    pts.append(f'{X0+i:.1f},{y:.1f}')
s+=f'<path d="M{X0} {Y0+HH-10}H{X0+WW}" stroke="#c3cfe6" stroke-width="1.5"/>'
for sec in (0,15,30,45,60):
    xx=X0+sec/60*WW; s+=f'<path d="M{xx} {Y0+HH-14}V{Y0+HH-6}" stroke="{GREY}"/><text x="{xx}" y="{Y0+HH+10}" font-size="11.5" fill="{GREY}" text-anchor="middle">{sec}s</text>'
s+=f'<polyline points="{" ".join(pts)}" fill="none" stroke="{BLUE}" stroke-width="2.5"/>'
per=WW/n
# highlight one breath
hx=X0+per*3
s+=f'<rect x="{hx}" y="{Y0+20}" width="{per}" height="{HH-40}" fill="{BLUE}" opacity=".08"/>'
s+=f'<path d="M{hx} {Y0+18}H{hx+per}" stroke="{INK}" stroke-width="1.5" marker-start="url(#ag)" marker-end="url(#ag)"/><text x="{hx+per/2}" y="{Y0+10}" font-size="12" font-weight="700" fill="{INK}" text-anchor="middle">1 breath</text>'
for k in range(n):
    px=X0+per*k+per/2; s+=f'<circle cx="{px}" cy="{Y0+HH/2-50}" r="4" fill="{GRN}"/>'
s+=f'<text x="{X0}" y="{Y0+HH+42}" font-size="13" fill="{INK}"><tspan fill="{GRN}" font-weight="700">●</tspan> tap once at the top of each breath</text><text x="{X0}" y="{Y0+HH+62}" font-size="13" fill="{INK}">14 taps in 60 s = <tspan font-weight="700">14 breaths/min</tspan> (normal 12–20)</text>'
s+=foot('One breath is one full rise and fall. Count for the full 60 seconds; the app fills in your tap count.')
save('respiratory-guide.svg', s)
print('ok')
