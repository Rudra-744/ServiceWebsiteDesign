// Floor-plan scene drawing (reference `planSVG`), 600 × 520. `n` keeps clip-path/def ids unique per instance.
export function planSVG(n: string) {
  return `<svg class="plan h-auto w-full overflow-visible" viewBox="0 0 600 520" aria-hidden="true">
  <defs>
    <clipPath id="lensL${n}"><ellipse cx="208" cy="262" rx="168" ry="142"/></clipPath>
    <clipPath id="lensR${n}"><ellipse cx="392" cy="262" rx="168" ry="142"/></clipPath>
    <g id="room${n}">
      <rect x="20" y="100" width="560" height="220" fill="#F2F1EE"/>
      <rect x="20" y="320" width="560" height="110" fill="#DCD4C1"/>
      <rect x="340" y="140" width="170" height="124" fill="#C9DAFF"/>
      <path d="M425 140V264M340 202H510" stroke="#FFFFFF" stroke-width="5"/>
      <rect x="128" y="150" width="92" height="64" fill="none" stroke="#1A1A1F" stroke-width="3"/>
      <rect x="142" y="164" width="64" height="36" fill="#548CFF"/>
      <ellipse cx="200" cy="372" rx="140" ry="24" fill="#EEF3FF"/>
      <rect x="84" y="232" width="214" height="46" rx="16" fill="#3E77F0"/>
      <rect x="84" y="262" width="214" height="62" rx="16" fill="#548CFF"/>
      <path d="M322 206V318" stroke="#1A1A1F" stroke-width="3"/>
      <path d="M300 206h44l-10-24h-24z" fill="#FFFFFF" stroke="#1A1A1F" stroke-width="3" stroke-linejoin="round"/>
      <rect x="520" y="276" width="30" height="42" rx="4" fill="#1A1A1F"/>
      <circle cx="535" cy="258" r="22" fill="#3E7D5A"/>
    </g>
  </defs>
  <g class="plan-base">
    <g class="dimg" style="opacity:0">
      <path class="fill-none stroke-stone [stroke-width:1]" d="M60 34H540M60 28V40M540 28V40"/><text class="fill-stone [font:500_12px_var(--font-sans)]" x="300" y="24" text-anchor="middle">12.0 m</text>
      <path class="fill-none stroke-stone [stroke-width:1]" d="M34 60V460M28 60H40M28 460H40"/><text class="fill-stone [font:500_12px_var(--font-sans)]" x="22" y="264" text-anchor="middle" transform="rotate(-90 22 264)">10.0 m</text>
    </g>
    <rect class="room opacity-0" x="60" y="60" width="240" height="190" fill="#E4ECFF"/>
    <rect class="room opacity-0" x="300" y="60" width="240" height="190" fill="#F2F1EE"/>
    <rect class="room opacity-0" x="60" y="250" width="340" height="210" fill="#EEF3FF"/>
    <rect class="room opacity-0" x="400" y="250" width="140" height="210" fill="#DCE6FF"/>
    <path class="furn origin-center opacity-0 [transform-box:fill-box]" d="M78 78H282V104H104V200H78Z" fill="#FFFFFF" stroke="#1A1A1F" stroke-width="2"/>
    <circle class="furn origin-center opacity-0 [transform-box:fill-box]" cx="205" cy="178" r="26" fill="#FFFFFF" stroke="#1A1A1F" stroke-width="2"/>
    <rect class="furn origin-center opacity-0 [transform-box:fill-box]" x="370" y="88" width="132" height="124" rx="10" fill="#548CFF"/>
    <rect class="furn origin-center opacity-0 [transform-box:fill-box]" x="380" y="96" width="52" height="24" rx="7" fill="#FFFFFF"/>
    <rect class="furn origin-center opacity-0 [transform-box:fill-box]" x="440" y="96" width="52" height="24" rx="7" fill="#FFFFFF"/>
    <rect class="furn origin-center opacity-0 [transform-box:fill-box]" x="312" y="74" width="24" height="112" fill="#FFFFFF" stroke="#1A1A1F" stroke-width="2"/>
    <rect class="furn origin-center opacity-0 [transform-box:fill-box]" x="86" y="394" width="176" height="44" rx="12" fill="#548CFF"/>
    <rect class="furn origin-center opacity-0 [transform-box:fill-box]" x="138" y="326" width="74" height="38" rx="9" fill="#FFFFFF" stroke="#1A1A1F" stroke-width="2"/>
    <circle class="furn origin-center opacity-0 [transform-box:fill-box]" cx="368" cy="284" r="13" fill="#3E7D5A"/>
    <rect class="furn origin-center opacity-0 [transform-box:fill-box]" x="420" y="398" width="102" height="44" rx="20" fill="#FFFFFF" stroke="#1A1A1F" stroke-width="2"/>
    <circle class="furn origin-center opacity-0 [transform-box:fill-box]" cx="506" cy="284" r="14" fill="#FFFFFF" stroke="#1A1A1F" stroke-width="2"/>
    <rect class="furn origin-center opacity-0 [transform-box:fill-box]" x="418" y="276" width="30" height="40" rx="10" fill="#FFFFFF" stroke="#1A1A1F" stroke-width="2"/>
    <text class="lbl fill-ink opacity-0 [font-stretch:108%] [font:600_15px_var(--font-sans)]" x="180" y="150" text-anchor="middle">Kitchen</text>
    <text class="lbl fill-ink opacity-0 [font-stretch:108%] [font:600_15px_var(--font-sans)]" x="436" y="236" text-anchor="middle">Bedroom</text>
    <text class="lbl fill-ink opacity-0 [font-stretch:108%] [font:600_15px_var(--font-sans)]" x="250" y="300" text-anchor="middle">Living</text>
    <text class="lbl fill-ink opacity-0 [font-stretch:108%] [font:600_15px_var(--font-sans)]" x="470" y="372" text-anchor="middle">Bath</text>
    <path class="wall fill-none stroke-ink [stroke-linecap:round] [stroke-width:5]" d="M60 60H540V460H312M248 460H60V60"/>
    <path class="wall fill-none stroke-ink [stroke-linecap:round] [stroke-width:5]" d="M300 60V204M60 250H168M222 250H540M400 250V392"/>
    <path class="win fill-none stroke-blue [stroke-linecap:round] [stroke-width:7]" style="opacity:0" d="M112 60H232M362 60H482M60 300V410M540 288V356"/>
  </g>
  <g class="lens-g origin-center [transform-box:fill-box] [transform:scale(0)]">
    <g clip-path="url(#lensL${n})"><use href="#room${n}" x="6"/></g>
    <g clip-path="url(#lensR${n})"><use href="#room${n}" x="-6"/></g>
    <ellipse cx="208" cy="262" rx="168" ry="142" fill="none" stroke="#1A1A1F" stroke-width="6"/>
    <ellipse cx="392" cy="262" rx="168" ry="142" fill="none" stroke="#1A1A1F" stroke-width="6"/>
  </g>
</svg>
<span class="buyer absolute rounded-full bg-ink px-4 py-[10px] text-[14.5px] font-[560] whitespace-nowrap text-white opacity-0 [transform:translateY(16px)_scale(.85)] [transition:opacity_.4s,transform_.7s_var(--e-spring)] max-[960px]:px-3 max-[960px]:py-2 max-[960px]:text-[12.5px] [&.on]:opacity-100 [&.on]:[transform:none]" style="left:2%;top:6%">Sales office</span>
<span class="buyer absolute rounded-full bg-ink px-4 py-[10px] text-[14.5px] font-[560] whitespace-nowrap text-white opacity-0 [transform:translateY(16px)_scale(.85)] [transition:opacity_.4s,transform_.7s_var(--e-spring)] max-[960px]:px-3 max-[960px]:py-2 max-[960px]:text-[12.5px] [&.on]:opacity-100 [&.on]:[transform:none]" style="right:2%;top:2%">Property launch</span>
<span class="buyer absolute rounded-full bg-ink px-4 py-[10px] text-[14.5px] font-[560] whitespace-nowrap text-white opacity-0 [transform:translateY(16px)_scale(.85)] [transition:opacity_.4s,transform_.7s_var(--e-spring)] max-[960px]:px-3 max-[960px]:py-2 max-[960px]:text-[12.5px] [&.on]:opacity-100 [&.on]:[transform:none]" style="left:0;bottom:4%">Exhibition stand</span>
<span class="buyer absolute rounded-full bg-ink px-4 py-[10px] text-[14.5px] font-[560] whitespace-nowrap text-white opacity-0 [transform:translateY(16px)_scale(.85)] [transition:opacity_.4s,transform_.7s_var(--e-spring)] max-[960px]:px-3 max-[960px]:py-2 max-[960px]:text-[12.5px] [&.on]:opacity-100 [&.on]:[transform:none]" style="right:0;bottom:0">Customer meeting</span>`;
}
