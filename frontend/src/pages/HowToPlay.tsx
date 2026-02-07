import { PageLayout } from '@/components/layout/PageLayout';
import { Compass, Calendar, Camera, Check, X, Trophy, Lightbulb } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function HowToPlay() {
  const rules = [
    {
      icon: Calendar,
      title: 'One new location daily',
      description: 'A mystery photo is revealed every day at midnight.',
    },
    {
      icon: Camera,
      title: 'Study the photo',
      description: 'View a cropped photo and guess the UGA location.',
    },
    {
      icon: Check,
      title: 'Correct guess',
      description: 'Earn points and keep your streak going!',
    },
    {
      icon: X,
      title: 'Incorrect guess',
      description: 'Get directions to explore the real spot.',
    },
    {
      icon: Trophy,
      title: 'Climb the leaderboard',
      description: 'Earn achievements and compete with other Dawgs.',
    },
  ];

  const tips = [
    'Look for architectural details like columns or brick patterns',
    'Check the hint after 30 seconds if you\'re stuck',
    'Visit locations you get wrong to learn more',
    'Maintain your streak for bonus point multipliers',
  ];

  const faqs = [
    {
      question: 'What happens if I miss a day?',
      answer: 'Your streak resets to zero, but all your earned points remain. Start a new streak the next day!',
    },
    {
      question: 'Can I go back to previous challenges?',
      answer: 'No, each challenge is available for one day only. This keeps the game fresh and encourages daily participation.',
    },
    {
      question: 'How are locations chosen?',
      answer: 'Locations are randomly selected from a pool of 50 UGA buildings and landmarks, ensuring you won\'t see the same place twice within a month.',
    },
  ];

  return (
    <PageLayout title="How It Works">
      {/* Hero Section */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
          <Compass className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Discover UGA, One Location at a Time
        </h2>
        <p className="mt-2 text-muted-foreground">
          A daily challenge to explore campus
        </p>
      </div>

      {/* Rules */}
      <div className="mb-8 space-y-4">
        <h3 className="text-lg font-bold text-foreground">The Rules</h3>
        {rules.map(({ icon: Icon, title, description }, index) => (
          <div
            key={title}
            className="flex items-start gap-4 rounded-xl bg-card p-4 shadow-card"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              {index + 1}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                <p className="font-medium text-foreground">{title}</p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Scoring */}
      <div className="mb-8 rounded-xl bg-card p-6 shadow-card">
        <h3 className="mb-4 text-lg font-bold text-foreground">Scoring System</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Correct guess</span>
            <span className="font-medium text-success">+50 points</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">First discovery bonus</span>
            <span className="font-medium text-success">+25 points</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">5+ day streak multiplier</span>
            <span className="font-medium text-warning">×1.5</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">10+ day streak multiplier</span>
            <span className="font-medium text-warning">×2</span>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mb-8 rounded-xl bg-accent p-6">
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-warning" />
          <h3 className="text-lg font-bold text-foreground">Pro Tips</h3>
        </div>
        <ul className="space-y-2">
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-foreground">
              <span className="text-primary">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* FAQ */}
      <div>
        <h3 className="mb-4 text-lg font-bold text-foreground">FAQ</h3>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-foreground">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </PageLayout>
  );
}
