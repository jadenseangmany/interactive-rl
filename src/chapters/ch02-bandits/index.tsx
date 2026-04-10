import { useState } from 'react'
import DatingGame from './demos/DatingGame'
import AgentPlaysDemo from './demos/AgentPlaysDemo'
import Checkpoint from '@/components/common/Checkpoint'

export default function Chapter02() {
  const [playerScore, setPlayerScore] = useState<number | null>(null)

  return (
    <div>
      {/* ====== Learning Outcomes ====== */}
      <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5 mb-10">
        <p className="text-lg font-bold text-primary mb-3">
          By the end of this section, you will understand the exploration-exploitation dilemma — the fundamental trade-off in reinforcement learning.
        </p>
        <p className="text-sm font-medium text-text-muted mb-2">You will also be able to:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-text-muted">
          <li>Explain why always picking the best-known option can lead to worse outcomes</li>
          <li>Describe how the epsilon-greedy strategy balances exploring new options with exploiting known good ones</li>
          <li>Map a real-world decision problem onto the formal k-armed bandit framework (arms, rewards, action values)</li>
        </ul>
      </div>

      {/* ====== Phase 1: You Play It ====== */}
      <section id="play">
        <p>
          You just moved to a new city. You don't know anyone yet, but you've got three
          potential people to go out with. Each person has a different <em>compatibility</em> with
          you — but you don't know who's the best match. You only have <strong>5 Friday nights</strong>.
        </p>
        <p>
          Your goal: <strong>have the best total experience across all 5 nights.</strong> Choose wisely.
        </p>

        <DatingGame onFinish={setPlayerScore} />
      </section>

      {/* ====== Phase 2: Name the Dilemma ====== */}
      <section id="dilemma" className="mt-14">
        <h2 className="text-2xl font-semibold mb-4">What Just Happened?</h2>
        <p>
          Think about the choices you made. Did you try all three people? Or did you go back
          to whoever gave you the best first date?
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-3">
          <li>
            If you <strong>tried everyone</strong>, you learned a lot — but you might have wasted
            nights on bad dates when you could have been with the best person.
          </li>
          <li>
            If you <strong>committed early</strong>, you had consistently okay dates — but what if
            someone you never tried was actually a better match?
          </li>
        </ul>
        <p className="mt-4">
          This tension — <strong className="text-primary">explore</strong> (try
          something new to learn more) vs. <strong className="text-primary">exploit</strong> (stick
          with the best thing you've found so far) — is the central problem of reinforcement learning.
        </p>
        <p className="mt-2">
          There's no perfect answer. Exploring too much wastes time. Exploiting too early means
          you might miss the best option entirely. The question is: <em>can we build a simple rule
          that balances the two?</em>
        </p>
      </section>

      {/* ====== Checkpoint 1 ====== */}
      <Checkpoint
        title="Checkpoint: Explore vs. Exploit"
        questions={[
          {
            question: 'You went on 2 dates with Alex (avg 5/10) and 1 date with Jordan (got 8/10). You have 2 nights left. What does "exploiting" mean here?',
            options: [
              'Try Casey, who you haven\'t dated yet',
              'Go out with Jordan again, since they gave the best date so far',
              'Pick someone at random',
              'Stop dating altogether',
            ],
            correctIndex: 1,
            explanation: 'Exploiting means going with the best option you know about so far. Jordan gave you the highest rating, so choosing Jordan again is exploiting. Trying Casey would be exploring — you\'d learn something new, but you\'re not guaranteed a good time.',
          },
          {
            question: 'A friend says: "Just always go with whoever gave you the best first date." What\'s the risk of this pure exploit strategy?',
            options: [
              'It guarantees the best outcome',
              'You might miss someone even better that you never tried',
              'It takes too long',
              'There is no risk — it\'s the optimal strategy',
            ],
            correctIndex: 1,
            explanation: 'A single date is noisy — someone might have a bad night or a great night that doesn\'t reflect their true compatibility. By never exploring, you could lock onto a mediocre match and never discover the best one.',
          },
        ]}
      />

      {/* ====== Phase 3: Watch the Agent ====== */}
      <section id="agent" className="mt-14">
        <h2 className="text-2xl font-semibold mb-4">A Simple Rule: Epsilon-Greedy</h2>
        <p>
          Here's one approach: <strong>most of the time, go with whoever seems best</strong> (exploit).
          But every now and then, <strong>pick someone at random</strong> (explore) — just to make
          sure you're not missing out.
        </p>
        <p className="mt-2">
          The parameter <strong>&epsilon;</strong> (epsilon) controls how often the agent explores.
          With &epsilon; = 0.3, it explores 30% of the time and exploits 70%. Step through the
          nights below and watch what the agent does — and <em>why</em>.
        </p>

        <AgentPlaysDemo playerScore={playerScore} />
      </section>

      {/* ====== Checkpoint 2 ====== */}
      <Checkpoint
        title="Checkpoint: Epsilon-Greedy"
        questions={[
          {
            question: 'An epsilon-greedy agent has \u03B5 = 0.1. On any given night, what does it do?',
            options: [
              'Explores 100% of the time',
              'Explores 10% of the time, exploits 90% of the time',
              'Explores 90% of the time, exploits 10% of the time',
              'Always picks the same person',
            ],
            correctIndex: 1,
            explanation: 'Epsilon (\u03B5) is the probability of exploring. With \u03B5 = 0.1, the agent picks a random option 10% of the time, and goes with the best-known option the other 90%.',
          },
          {
            question: 'What happens if you set \u03B5 = 0?',
            options: [
              'The agent explores every single night',
              'The agent becomes purely greedy — it never tries anything new',
              'The agent picks randomly every time',
              'The agent stops making decisions',
            ],
            correctIndex: 1,
            explanation: 'With \u03B5 = 0, the agent never explores. It always picks whichever option has the highest estimated value right now. This means it can get stuck on a suboptimal choice if its early experiences were misleading.',
          },
          {
            question: 'The agent\'s estimate for Casey is 7.2 after 3 dates. Casey\'s true compatibility is 8.0. Why is the estimate different from the truth?',
            options: [
              'The agent is broken',
              'Each date is noisy — you don\'t get the exact true score, so the average of a few dates is only an approximation',
              'The agent can\'t do math',
              'The estimate is always lower than the truth',
            ],
            correctIndex: 1,
            explanation: 'Each date gives a noisy rating around the true score. With only 3 dates, the average might be higher or lower than the truth. With more dates, the estimate gets closer — this is why exploring (getting more data) is valuable.',
          },
        ]}
      />

      {/* ====== Phase 4: Generalize ====== */}
      <section id="generalize" className="mt-14">
        <h2 className="text-2xl font-semibold mb-4">The k-Armed Bandit Problem</h2>
        <p>
          What you just played is a classic problem in reinforcement learning called
          the <strong>k-armed bandit problem</strong>. Let's map it back:
        </p>
        <table className="mt-4 w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-semibold">Dating Scenario</th>
              <th className="text-left py-2 font-semibold">Formal RL Term</th>
            </tr>
          </thead>
          <tbody className="text-text-muted">
            <tr className="border-b border-border">
              <td className="py-2 pr-4">3 people to date</td>
              <td className="py-2"><strong className="text-text">k = 3 arms</strong> (choices)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Going on a date</td>
              <td className="py-2"><strong className="text-text">Pulling an arm</strong> (taking an action)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Happiness rating (1-10)</td>
              <td className="py-2"><strong className="text-text">Reward</strong> (R<sub>t</sub>)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">True compatibility</td>
              <td className="py-2"><strong className="text-text">True value</strong> q*(a) — the real average reward for action a</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Your running average</td>
              <td className="py-2"><strong className="text-text">Estimated value</strong> Q<sub>t</sub>(a) — your best guess at time t</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Random vs. best-known choice</td>
              <td className="py-2"><strong className="text-text">&epsilon;-greedy</strong> — explore with probability &epsilon;, exploit otherwise</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-5">
          The "bandit" name comes from slot machines (one-armed bandits). Instead of
          dating, imagine pulling the lever on different slot machines — same problem,
          just less romantic. The textbook uses this to build up to the full
          reinforcement learning problem, where actions also affect what happens next.
        </p>
      </section>

      {/* ====== Checkpoint 3 ====== */}
      <Checkpoint
        title="Checkpoint: Mapping to the Formal Framework"
        questions={[
          {
            question: 'A doctor tries 4 different treatments on patients and tracks recovery rates. In the k-armed bandit framework, what is k?',
            options: [
              'The number of patients',
              'The recovery rate',
              '4 — the number of treatments (actions)',
              'The number of days in the trial',
            ],
            correctIndex: 2,
            explanation: 'k is the number of actions (arms) to choose from. Here that\'s the 4 treatments. Each time the doctor picks a treatment, that\'s "pulling an arm." The recovery outcome is the reward.',
          },
          {
            question: 'In the dating scenario, your running average rating for Jordan is Q\u209C(a). What does q*(a) represent?',
            options: [
              'The best date you\'ve ever had with Jordan',
              'Jordan\'s true average compatibility — what you\'d get if you went on infinite dates',
              'The rating from your most recent date',
              'The highest possible rating (10/10)',
            ],
            correctIndex: 1,
            explanation: 'q*(a) is the true expected reward — the average you\'d converge to over infinite trials. You never know q*(a) exactly; your estimate Q\u209C(a) gets closer to it as you gather more data.',
          },
        ]}
      />
    </div>
  )
}
