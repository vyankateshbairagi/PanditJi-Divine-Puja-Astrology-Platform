import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Quote, Star } from 'lucide-react';

const FEATURED_SERVICES = [
  {
    title: 'Griha Pravesh Puja',
    price: 'Starting at ₹2,999',
    rating: '4.9',
    image: '/images/GrihaPravesh.png',
  },
  {
    title: 'Satyanarayan Puja',
    price: 'Starting at ₹1,499',
    rating: '4.8',
    image: '/images/Satyanarayan.jpg',
  },
  {
    title: 'Rudrabhishek',
    price: 'Starting at ₹2,499',
    rating: '4.9',
    image: '/images/Rudrabhishek.jpeg',
  },
  {
    title: 'Navchandi Havan',
    price: 'Starting at ₹3,499',
    rating: '4.8',
    image: '/images/NavchandiHavan.jpg',
  },
];

const TOP_RATED_PANDITS = [
  {
    name: 'Pandit Rajesh Sharma',
    experience: 'Exp. 12+ Years',
    location: 'Varanasi',
    rating: '4.9',
    reviews: '320',
    initials: 'RS',
    accent: 'from-[#f5c97e] to-[#b76a18]',
  },
  {
    name: 'Pandit Anil Mishra',
    experience: 'Exp. 10+ Years',
    location: 'Prayagraj',
    rating: '4.8',
    reviews: '280',
    initials: 'AM',
    accent: 'from-[#f0b65e] to-[#9e5313]',
  },
  {
    name: 'Pandit Deepak Joshi',
    experience: 'Exp. 8+ Years',
    location: 'Ujjain',
    rating: '4.9',
    reviews: '256',
    initials: 'DJ',
    accent: 'from-[#f6c57a] to-[#b86c1a]',
  },
];

const TESTIMONIALS = [
  {
    text: 'PanditJi made our Griha Pravesh ceremony so peaceful and perfect. Highly recommended!',
    author: 'Rahul Sharma',
    city: 'Mumbai',
  },
  {
    text: 'Very easy booking process and the Pandit arrived on time. The entire puja was beautifully done.',
    author: 'Sneha Iyer',
    city: 'Bengaluru',
  },
  {
    text: 'Authentic service, knowledgeable Pandit and great support team. Thank you PanditJi!',
    author: 'Amit Verma',
    city: 'Delhi',
  },
];

const HomeHighlightsSection = () => {
  const navigate = useNavigate();

  return (
    <section className="mx-auto w-[calc(100%-2rem)] max-w-[1360px] py-6 sm:w-[calc(100%-2.5rem)] sm:py-8 lg:py-10">
      <div className="rounded-[30px] border border-[#edd9b4] bg-[radial-gradient(circle_at_top_left,rgba(255,248,239,0.95),rgba(250,239,221,0.98))] px-4 py-4 shadow-[0_18px_50px_rgba(95,59,20,0.08)] sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        <div className="grid gap-5 lg:grid-cols-[1.18fr_0.92fr]">
          <section className="overflow-hidden rounded-[26px] border border-[rgba(214,179,116,0.25)] bg-white/80 p-4 shadow-[0_10px_28px_rgba(98,60,20,0.08)] backdrop-blur-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[clamp(1.35rem,2.5vw,1.9rem)] font-bold leading-tight text-[#3c2517]">
                  Featured Puja Services
                </h2>
                <p className="mt-1 text-sm text-[#8a6749]">
                  Popular services booked by devotees across India.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/services')}
                className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(180,118,27,0.25)] bg-[#fff7ec] px-3.5 py-2 text-xs font-semibold text-[#8f5d1b] transition hover:-translate-y-0.5 hover:border-[#d39a37] hover:bg-[#fff3dd]"
              >
                View All <ArrowRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {FEATURED_SERVICES.map((service) => (
                <button
                  key={service.title}
                  type="button"
                  onClick={() => navigate('/services')}
                  className="group overflow-hidden rounded-[18px] border border-[#efdcc1] bg-white text-left shadow-[0_6px_18px_rgba(91,55,19,0.06)] transition hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(91,55,19,0.12)]"
                >
                  <div className="relative h-[115px] overflow-hidden bg-[#f4e4cf]">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,4,0,0.05)_0%,rgba(8,4,0,0.35)_100%)]" />
                  </div>

                  <div className="px-3 py-3">
                    <h3 className="line-clamp-2 min-h-[40px] text-[14px] font-semibold leading-[1.35] text-[#3b2618]">
                      {service.title}
                    </h3>
                    <p className="mt-1 text-[12px] text-[#7b6047]">
                      {service.price}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold text-[#c88a1c]">
                      <Star size={12} className="fill-[#f3b53f] text-[#f3b53f]" />
                      {service.rating}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-[26px] border border-[rgba(214,179,116,0.25)] bg-white/80 p-4 shadow-[0_10px_28px_rgba(98,60,20,0.08)] backdrop-blur-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[clamp(1.35rem,2.5vw,1.9rem)] font-bold leading-tight text-[#3c2517]">
                  Top Rated Pandits
                </h2>
                <p className="mt-1 text-sm text-[#8a6749]">
                  Trusted, verified, and highly rated by devotees.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/find-pandit')}
                className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(180,118,27,0.25)] bg-[#fff7ec] px-3.5 py-2 text-xs font-semibold text-[#8f5d1b] transition hover:-translate-y-0.5 hover:border-[#d39a37] hover:bg-[#fff3dd]"
              >
                View All <ArrowRight size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {TOP_RATED_PANDITS.map((pandit) => (
                <button
                  key={pandit.name}
                  type="button"
                  onClick={() => navigate('/find-pandit')}
                  className="flex w-full items-center justify-between gap-4 rounded-[20px] border border-[#efdfc3] bg-white px-3 py-3 text-left shadow-[0_5px_14px_rgba(94,58,20,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(94,58,20,0.1)]"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${pandit.accent} text-sm font-bold text-white shadow-[0_8px_18px_rgba(120,70,18,0.16)]`}>
                      {pandit.initials}
                      <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#2cb34a]" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-[15px] font-semibold text-[#332114]">
                        {pandit.name}
                      </h3>
                      <p className="mt-0.5 text-[12px] text-[#7c6247]">
                        {pandit.experience}  •  {pandit.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-[13px] font-semibold text-[#c88a1c]">
                        <Star size={13} className="fill-[#f3b53f] text-[#f3b53f]" />
                        {pandit.rating} <span className="text-[#8d7357]">({pandit.reviews})</span>
                      </div>
                    </div>

                    <span className="inline-flex rounded-full border border-[rgba(140,70,20,0.2)] bg-[#fff7ef] px-3 py-2 text-xs font-semibold text-[#8a4e12] transition group-hover:bg-[#fff1da]">
                      Book Now
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-5 rounded-[26px] border border-[rgba(214,179,116,0.25)] bg-white/75 px-4 py-5 shadow-[0_10px_24px_rgba(98,60,20,0.06)] sm:px-5">
          <div className="text-center">
            <h2 className="text-[clamp(1.55rem,3vw,2rem)] font-bold text-[#3c2517]">
              What Devotees Say
            </h2>
            <div className="mx-auto mt-2 flex w-fit items-center gap-2 text-[#d39a3d]">
              <span className="h-px w-16 bg-[#e7d0a7]" />
              <span className="text-[15px] leading-none">❉</span>
              <span className="h-px w-16 bg-[#e7d0a7]" />
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial) => (
              <article
                key={testimonial.author}
                className="rounded-[18px] border border-[#f0e0c4] bg-white px-4 py-4 shadow-[0_6px_18px_rgba(91,55,19,0.06)]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff4df] text-[#c88a1c]">
                    <Quote size={16} />
                  </div>
                  <p className="text-[13px] leading-[1.65] text-[#5e4837]">
                    {testimonial.text}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#7e1d2f] to-[#c88a1c] text-sm font-bold text-white shadow-[0_8px_18px_rgba(122,16,36,0.16)]">
                    {testimonial.author
                      .split(' ')
                      .map((part) => part[0])
                      .join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#382216]">
                      {testimonial.author}
                    </p>
                    <p className="text-xs text-[#8d6f55]">
                      {testimonial.city}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
};

export default HomeHighlightsSection;