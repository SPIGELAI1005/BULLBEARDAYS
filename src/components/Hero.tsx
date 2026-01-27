import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AnimatedLogo from "./AnimatedLogo";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const line3Ref = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const stat1Ref = useRef<HTMLDivElement>(null);
  const stat2Ref = useRef<HTMLDivElement>(null);
  const stat3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const line1 = line1Ref.current;
    const line2 = line2Ref.current;
    const line3 = line3Ref.current;
    const description = descriptionRef.current;
    const stats = statsRef.current;
    const stat1 = stat1Ref.current;
    const stat2 = stat2Ref.current;
    const stat3 = stat3Ref.current;

    if (!section || !line1 || !line2 || !line3 || !description || !stats || !stat1 || !stat2 || !stat3) return;

    // Set initial states
    gsap.set([line1, line2, line3], { 
      clipPath: "inset(0 100% 0 0)",
      opacity: 1 
    });
    gsap.set(line2, { 
      clipPath: "inset(0 0 0 100%)" 
    });
    gsap.set([description, stats], { 
      opacity: 0, 
      y: 20 
    });

    // Counter objects for animation
    const counter1 = { value: 0 };
    const counter2 = { value: 0 };
    const counter3 = { value: 0 };

    // Create the scroll-triggered timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=150%",
        pin: true,
        scrub: 1,
        anticipatePin: 1,
      }
    });

    // Line 1: Reveal from left to right (typewriter effect)
    tl.to(line1, {
      clipPath: "inset(0 0% 0 0)",
      duration: 0.4,
      ease: "none"
    })
    // Line 2: Reveal from right to left
    .to(line2, {
      clipPath: "inset(0 0 0 0%)",
      duration: 0.4,
      ease: "none"
    })
    // Line 3: Reveal from left to right (centered text)
    .to(line3, {
      clipPath: "inset(0 0% 0 0)",
      duration: 0.4,
      ease: "none"
    })
    // Fade in description
    .to(description, {
      opacity: 1,
      y: 0,
      duration: 0.2,
      ease: "power2.out"
    })
    // Fade in stats container
    .to(stats, {
      opacity: 1,
      y: 0,
      duration: 0.1,
      ease: "power2.out"
    })
    // Counter animation for stat 1: "3"
    .to(counter1, {
      value: 3,
      duration: 0.15,
      ease: "power1.out",
      onUpdate: () => {
        if (stat1) stat1.textContent = Math.round(counter1.value).toString();
      }
    }, "-=0.05")
    // Counter animation for stat 2: "<30s"
    .to(counter2, {
      value: 30,
      duration: 0.15,
      ease: "power1.out",
      onUpdate: () => {
        if (stat2) stat2.textContent = `<${Math.round(counter2.value)}s`;
      }
    }, "-=0.1")
    // Counter animation for stat 3: "24/7"
    .to(counter3, {
      value: 24,
      duration: 0.15,
      ease: "power1.out",
      onUpdate: () => {
        if (stat3) stat3.textContent = `${Math.round(counter3.value)}/7`;
      }
    }, "-=0.1");

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen pt-44 pb-10 px-4 md:pt-56 md:pb-12 md:px-6 overflow-hidden"
    >
      {/* Background Glow Effects */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-bullish/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-bearish/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Animated Logo with Cinema Light Effect */}
        <div className="mb-8 md:mb-12 flex justify-center">
          <AnimatedLogo />
        </div>

        {/* Headline with scroll-triggered typewriter animation */}
        <div className="mb-4 md:mb-6 space-y-4 md:space-y-6">
          {/* Line 1: Left aligned, reveals left to right */}
          <div 
            ref={line1Ref}
            className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground tracking-tight text-left"
          >
            Some Days are un<span className="text-bullish font-bold">BULL</span>ivable.
          </div>
          
          {/* Line 2: Right aligned, reveals right to left */}
          <div 
            ref={line2Ref}
            className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground tracking-tight text-right"
          >
            Other Days are un<span className="text-bearish font-bold">BEAR</span>able.
          </div>
          
          {/* Line 3: Center aligned */}
          <div 
            ref={line3Ref}
            className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground tracking-tight text-center pt-2"
          >
            Execute AI-Powered{" "}
            <span className="text-gradient-gold">Scenario Analysis</span>
            {" "}in Seconds.
          </div>
        </div>

        {/* Description - fades in after text reveal */}
        <p 
          ref={descriptionRef}
          className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed text-center px-1"
        >
          Upload any chart screenshot and let multiple AI models evaluate the technical setup,
          market sentiment, and key risks. You'll receive clear Bull and Bear scenarios, so you can
          understand possible market outcomes and make more informed decisions.
        </p>

        {/* Stats - fades in after description with counter effect */}
        <div 
          ref={statsRef}
          className="flex flex-wrap items-center justify-center gap-4 md:gap-8 lg:gap-12"
        >
          <div className="text-center">
            <div ref={stat1Ref} className="text-2xl font-bold text-foreground">0</div>
            <div className="text-xs text-muted-foreground">AI Models</div>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-center">
            <div ref={stat2Ref} className="text-2xl font-bold text-bullish">&lt;0s</div>
            <div className="text-xs text-muted-foreground">Analysis Time</div>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-center">
            <div ref={stat3Ref} className="text-2xl font-bold text-foreground">0/7</div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
