import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserPlusIcon,
  ChartBarIcon,
  TicketIcon,
  TrophyIcon,
  HeartIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const steps = [
  {
    icon: UserPlusIcon,
    title: 'Sign Up & Subscribe',
    description: 'Create your account and choose your subscription plan. Monthly or yearly - you decide what works best.',
    details: [
      'Quick registration process',
      'Secure payment via Stripe',
      'Instant access to all features',
      'Cancel anytime, no questions asked'
    ]
  },
  {
    icon: ChartBarIcon,
    title: 'Enter Your Scores',
    description: 'After each round of golf, enter your Stableford score (1-45 points). Your latest 5 scores become your draw numbers.',
    details: [
      'Stableford scoring system (1-45)',
      'Rolling system - new scores replace oldest',
      'Track your scoring history',
      'Scores are validated automatically'
    ]
  },
  {
    icon: HeartIcon,
    title: 'Choose Your Charity',
    description: 'Select a charity that matters to you. A minimum of 10% of all subscription revenue goes directly to charities.',
    details: [
      'Choose from verified charities',
      'Change your selection anytime',
      'Track contributions made in your name',
      'Supporting causes that matter'
    ]
  },
  {
    icon: TicketIcon,
    title: 'Enter Monthly Draws',
    description: 'Once you have 5 scores, you\'re automatically entered into the monthly draw. Your scores are your lucky numbers!',
    details: [
      'Automatic entry for subscribers',
      'Draw held on the last day of each month',
      'Transparent random number generation',
      'Fair and verified process'
    ]
  },
  {
    icon: TrophyIcon,
    title: 'Win & Verify',
    description: 'Match 3, 4, or all 5 numbers to win! Winners verify their identity to claim prizes.',
    details: [
      '3 numbers = Share of prize tier',
      '4 numbers = Larger prize share',
      '5 numbers = Jackpot winner!',
      'Simple verification process'
    ]
  }
];

const prizeBreakdown = [
  { tier: '5 Numbers', percentage: '40%', odds: 'Rare' },
  { tier: '4 Numbers', percentage: '20%', odds: 'Uncommon' },
  { tier: '3 Numbers', percentage: '10%', odds: 'Common' },
  { tier: 'Charity', percentage: '10%+', odds: 'Guaranteed' },
  { tier: 'Operations', percentage: '20%', odds: '-' },
];

export default function HowItWorks() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            How <span className="gradient-text">GolfCharity</span> Works
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From your golf course to winning prizes and supporting charity -
            here's how your journey unfolds.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-20 mb-20">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`grid lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <span className="text-sm font-medium text-primary-400">Step {index + 1}</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">{step.title}</h2>
                <p className="text-gray-300 text-lg mb-6">{step.description}</p>
                <ul className="space-y-3">
                  {step.details.map((detail, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                      <span className="text-gray-400">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`card p-8 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center">
                  <step.icon className="w-24 h-24 text-gray-700" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Prize Pool Breakdown */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prize Pool <span className="gradient-text">Breakdown</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Here's how subscription revenue is distributed each month
            </p>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">% of Pool</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Win Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {prizeBreakdown.map((item, index) => (
                    <tr key={item.tier} className="border-b border-white/5">
                      <td className="px-6 py-4">
                        <span className={`font-medium ${index < 3 ? 'text-primary-400' : 'text-gray-300'}`}>
                          {item.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full bg-white/5 text-sm">
                          {item.percentage}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{item.odds}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.section>

        {/* Scoring System */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stableford <span className="gradient-text">Scoring</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We use the Stableford scoring system, which awards points based on your performance relative to par.
            </p>
          </div>

          <div className="card p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-400 mb-2">1-45</div>
                <p className="text-gray-400">Score Range</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-accent-400 mb-2">5</div>
                <p className="text-gray-400">Scores Used in Draw</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-2">3+</div>
                <p className="text-gray-400">Matches to Win</p>
              </div>
            </div>
            <div className="mt-8 p-6 bg-white/5 rounded-xl">
              <h4 className="font-semibold mb-3">Example</h4>
              <p className="text-gray-400">
                If your last 5 scores are 32, 28, 36, 24, and 41, these become your draw numbers.
                If the winning numbers are 32, 15, 36, 24, and 8, you've matched 3 numbers (32, 36, 24)
                and qualify for the 3-number prize tier!
              </p>
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-6">Ready to Start?</h2>
          <Link to="/register" className="btn-primary text-lg px-8 py-4">
            Join GolfCharity
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
