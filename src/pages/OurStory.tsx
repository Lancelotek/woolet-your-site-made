import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { STORY_TITLE, STORY_DESCRIPTION, STORY_HTML, STORY_JSONLD, STORY_CTA, STORY_FIT_LINK, STORY_SIGNATURE } from "@/content/our-story";
import "./OurStory.css";

export default function OurStory() {
  return <>
    <SEO title={STORY_TITLE} exactTitle description={STORY_DESCRIPTION} lang="en" path="/our-story" jsonLd={STORY_JSONLD} />
    <Navbar />
    <main className="min-h-screen bg-background text-foreground">
      <article className="our-story max-w-3xl mx-auto px-5 pb-20 sm:pb-28">
        <div dangerouslySetInnerHTML={{ __html: STORY_HTML }} />
        <div className="mt-10 flex flex-col items-start gap-5">
          <Button asChild size="lg" className="rounded-[2px] h-auto min-h-12 whitespace-normal py-4 hover:bg-gold-light">
            <Link to="/en/lp/kickstarter">{STORY_CTA}</Link>
          </Button>
          <Link to="/en/fit" className="text-sm leading-relaxed text-muted-foreground underline underline-offset-4 hover:text-primary">{STORY_FIT_LINK}</Link>
        </div>
        <p className="story-signature">{STORY_SIGNATURE}</p>
      </article>
    </main>
    <Footer lang="en" />
  </>;
}