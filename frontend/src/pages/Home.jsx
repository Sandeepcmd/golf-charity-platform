import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  TrophyIcon,
  HeartIcon,
  ChartBarIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: ChartBarIcon,
    title: 'Track Your Scores',
    description: 'Enter your Stableford scores after each round. Your latest 5 scores become your lucky draw numbers.'
  },
  {
    icon: SparklesIcon,
    title: 'Win Big Prizes',
    description: 'Match 3, 4, or all 5 numbers in our monthly draw to win cash prizes from the prize pool.'
  },
  {
    icon: HeartIcon,
    title: 'Support Charity',
    description: 'Choose your charity. A minimum 10% of the prize pool goes directly to charitable causes you care about.'
  },
  {
    icon: TrophyIcon,
    title: 'Monthly Draws',
    description: 'Every month brings new opportunities to win. The more you play, the better your chances.'
  }
];

const stats = [
  { label: 'Active Players', value: '10,000+' },
  { label: 'Prizes Awarded', value: '$500K+' },
  { label: 'Charities Supported', value: '50+' },
  { label: 'Charity Contributions', value: '$100K+' },
];

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
            >
              <SparklesIcon className="w-5 h-5 text-primary-400" />
              <span className="text-sm font-medium">The Future of Golf Gaming</span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6">
              <span className="gradient-text">Play. Win. Give.</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10">
              Transform your golf scores into winning numbers. Enter monthly draws,
              win exciting prizes, and support charities you love.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-lg px-8 py-4">
                Start Playing
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/how-it-works" className="btn-secondary text-lg px-8 py-4">
                How It Works
              </Link>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
            >
              {stats.map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-white"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Golf Meets <span className="gradient-text">Winning</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A revolutionary platform that turns your golf passion into prizes and charitable impact.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-hover p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Preview */}
      <section className="py-20 md:py-32 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Your Scores, <br />
                <span className="gradient-text">Your Numbers</span>
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                Every Stableford score you record becomes part of your unique draw entry.
                Your latest 5 scores form your lucky numbers for the monthly draw.
              </p>
              <ul className="space-y-4">
                {[
                  'Scores range from 1-45 Stableford points',
                  'Rolling system - new scores push out old ones',
                  'Match 3+ winning numbers to win prizes',
                  'Automatic entry for active subscribers'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-primary-400 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/how-it-works" className="btn-outline mt-8 inline-flex">
                Learn More
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Score balls visualization */}
              <div className="card p-8">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-400 mb-2">Your Draw Numbers</p>
                  <div className="flex justify-center gap-4">
                    {[32, 28, 36, 24, 41].map((num, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xl font-bold shadow-lg shadow-primary-500/30"
                      >
                        {num}
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-white/10 pt-6">
                  <p className="text-center text-sm text-gray-400 mb-4">Winning Numbers</p>
                  <div className="flex justify-center gap-4">
                    {[32, 15, 36, 24, 8].map((num, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${
                          [32, 36, 24].includes(num)
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/30'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {num}
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-medium">
                    <TrophyIcon className="w-5 h-5" />
                    3 Numbers Matched - Winner!
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to <span className="gradient-text">Transform Your Game?</span>
            </h2>
            <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
              Join thousands of golfers who are already winning prizes and making
              a difference. Start your journey today.
            </p>
            <Link to="/register" className="btn-primary text-lg px-10 py-4">
              Get Started for $9.99/month
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
            <p className="text-sm text-gray-500 mt-4">
              No commitment. Cancel anytime.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
