/**
 * Built-in style-page text. Used only for styles whose eyebrow/caption have never been set in the
 * admin (Admin → Categories → Styles). Once an admin saves a value it always wins.
 */
export const STYLE_LABELS: Record<string, { name: string; eyebrow: string; caption: string }> = {
  'soft-girl':        { name: 'Soft Girl',        eyebrow: 'Bloom Into You',     caption: 'Soft. Sweet. Eternal.'       },
  'glam-look':        { name: 'Glam Look',        eyebrow: 'Own The Room',       caption: 'Gilded. Bold. Unapologetic.' },
  'island-girl':      { name: 'Island Girl',      eyebrow: 'Salt & Spirit',      caption: 'Breezy. Free. Sun-kissed.'   },
  'office-jewellery': { name: 'Office Jewellery', eyebrow: 'Quiet Authority',    caption: 'Refined. Subtle. Powerful.'  },
  'maximalist':       { name: 'Maximalist',       eyebrow: 'More Is More',       caption: 'Loud. Layered. Limitless.'   },
  'fairy-coded':      { name: 'Fairy Coded',      eyebrow: 'Enchant Everything', caption: 'Whimsical. Magical. Rare.'   },
  'men-street-edge':  { name: 'Street Edge',      eyebrow: 'Street Edge',        caption: 'Bold. Raw. Unapologetic.'    },
  'men-corporate':    { name: 'Corporate Sharp',  eyebrow: 'Corporate Sharp',    caption: 'Refined. Sleek. Precise.'    },
  'men-island':       { name: 'Island King',      eyebrow: 'Island King',        caption: 'Laid-back. Sun-kissed.'      },
  'men-minimal':      { name: 'Minimal Stack',    eyebrow: 'Minimal Stack',      caption: 'Clean. Intentional. Strong.' },
  'men-rocker':       { name: 'Rocker Noir',      eyebrow: 'Rocker Noir',        caption: 'Dark. Sharp. Rebellious.'    },
  'men-gold':         { name: 'Gold Royalty',     eyebrow: 'Gold Royalty',       caption: 'Rich. Heavy. Statement.'     },
};
