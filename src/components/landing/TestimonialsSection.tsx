import { motion } from 'framer-motion';
import { TestimonialsColumn, type Testimonial } from './TestimonialsColumn';

const testimonials: Testimonial[] = [
  {
    text: 'DOGYPT turned my golden retriever into a pharaoh. The artwork is hanging above my fireplace and every guest stops to admire it.',
    image: 'https://i.pravatar.cc/80?img=12',
    name: 'Sarah M.',
    role: 'Owner of Apollo',
  },
  {
    text: 'I cried when I unwrapped it. They captured my Luna\'s soul in a way no photo ever could. Pure magic.',
    image: 'https://i.pravatar.cc/80?img=47',
    name: 'Marcus T.',
    role: 'Owner of Luna',
  },
  {
    text: 'The detail in every hieroglyph is unreal. You can tell they actually listened to who my dog is, not just what he looks like.',
    image: 'https://i.pravatar.cc/80?img=33',
    name: 'Elena R.',
    role: 'Owner of Pharaoh',
  },
  {
    text: 'Worth every penny. The packaging alone felt like opening a treasure from a tomb. My dog deserves nothing less.',
    image: 'https://i.pravatar.cc/80?img=5',
    name: 'James K.',
    role: 'Owner of Bastet',
  },
  {
    text: 'Ordered one for my grandmother\'s late dachshund. She hasn\'t stopped smiling since it arrived. Thank you DOGYPT.',
    image: 'https://i.pravatar.cc/80?img=23',
    name: 'Priya N.',
    role: 'Owner of Ra',
  },
  {
    text: 'I\'m an art collector and this piece holds its own next to anything I own. Genuinely museum-quality work.',
    image: 'https://i.pravatar.cc/80?img=15',
    name: 'David L.',
    role: 'Owner of Anubis',
  },
  {
    text: 'The custom feature blew my mind — they wove in my dog\'s favourite hike as a hieroglyph. Personal beyond words.',
    image: 'https://i.pravatar.cc/80?img=44',
    name: 'Yuki H.',
    role: 'Owner of Khonsu',
  },
  {
    text: 'Three of my friends have already ordered theirs after seeing mine. DOGYPT is going to be everywhere soon.',
    image: 'https://i.pravatar.cc/80?img=9',
    name: 'Olivia B.',
    role: 'Owner of Cleo',
  },
  {
    text: 'It\'s not just art, it\'s a love letter to my dog written in gold. I get emotional every time I look at it.',
    image: 'https://i.pravatar.cc/80?img=51',
    name: 'Rafael C.',
    role: 'Owner of Horus',
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="relative py-24 md:py-32 overflow-hidden"
      style={{ backgroundColor: '#000000' }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center mb-12 md:mb-16"
        >
          <span
            className="text-xs md:text-sm tracking-[0.3em] uppercase mb-3"
            style={{ fontFamily: "'Cinzel', serif", color: '#C49B42' }}
          >
            People Say
          </span>
          <h2
            className="text-4xl md:text-5xl font-black tracking-wider"
            style={{
              fontFamily: "'Cinzel', serif",
              background: 'linear-gradient(135deg, #A3782B, #C49B42, #A3782B)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            IN DOG WE TRUST
          </h2>
          <p
            className="mt-4 max-w-xl text-base md:text-lg"
            style={{ color: 'rgba(250,244,236,0.7)', fontFamily: "'Cormorant Garamond', serif" }}
          >
            Stories from the dog parents who turned their companions into legends.
          </p>
        </motion.div>

        <div
          className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]"
          style={{ maxHeight: '640px', overflow: 'hidden' }}
        >
          <TestimonialsColumn testimonials={firstColumn} duration={18} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={22} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={20} />
        </div>
      </div>
    </section>
  );
}