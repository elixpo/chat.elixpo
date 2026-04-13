"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import CloseButton from "@/components/CloseButton";
import SourcePill from "@/components/SourcePill";

interface TimelineEntry {
  type: "male" | "female" | "image";
  content: string;
  start: number;
  end: number;
}

interface CarouselImage {
  time: number;
  url: string;
  description: string;
}

export default function PodcastPage() {
  const [podcastName, setPodcastName] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [sourceLink, setSourceLink] = useState("");
  const [gradientColor, setGradientColor] = useState("#1a1a2e");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [loaded, setLoaded] = useState(false);

  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [activeSubtitle, setActiveSubtitle] = useState("");
  const [activeSpeaker, setActiveSpeaker] = useState<"male" | "female" | "">("");
  const [activeCarouselUrl, setActiveCarouselUrl] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const speeds = [1, 1.5, 2];

  useEffect(() => {
    // Fetch podcast data
    fetch("/api/podcast")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setPodcastName(data.podcast_name);
        setBannerUrl(data.podcast_banner_url);
        setThumbnailUrl(data.podcast_thumbnail_url || "");
        setSourceLink(data.topic_source);

        audioRef.current = new Audio(data.podcast_audio_url);
        audioRef.current.preload = "metadata";
        audioRef.current.addEventListener("loadedmetadata", () => setDuration(audioRef.current!.duration));
        audioRef.current.addEventListener("timeupdate", () => setCurrentTime(audioRef.current!.currentTime));
        audioRef.current.addEventListener("play", () => setIsPlaying(true));
        audioRef.current.addEventListener("pause", () => setIsPlaying(false));
        audioRef.current.addEventListener("ended", () => setIsPlaying(false));
        setLoaded(true);
      })
      .catch(console.error);

    // Fetch podcast details (has gradient, timeline, carousel)
    fetch("/api/podcast-details")
      .then((r) => r.json())
      .then((details) => {
        if (details.gradientColor) setGradientColor(details.gradientColor);
        if (details.carouselImages) setCarouselImages(details.carouselImages);

        // Fetch timeline from URL
        if (details.timelineUrl) {
          fetch(details.timelineUrl)
            .then((r) => r.json())
            .then((t) => setTimeline(t))
            .catch(() => {});
        }
      })
      .catch(() => {});

    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    };
  }, []);

  // Sync timeline with current time
  const updateTimeline = useCallback(() => {
    if (!timeline.length) return;
    const t = currentTime;

    // Find active speech segment
    const speechEntry = timeline.find(
      (e) => (e.type === "male" || e.type === "female") && t >= e.start && t < e.end
    );
    if (speechEntry) {
      setActiveSubtitle(speechEntry.content);
      setActiveSpeaker(speechEntry.type as "male" | "female");
    }

    // Find active carousel image (show the most recent one that has passed)
    const passedImages = carouselImages.filter((img) => t >= img.time);
    if (passedImages.length > 0) {
      const latest = passedImages[passedImages.length - 1];
      setActiveCarouselUrl(latest.url);
    }
  }, [currentTime, timeline, carouselImages]);

  useEffect(() => { updateTimeline(); }, [updateTimeline]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) audioRef.current.play(); else audioRef.current.pause();
  };

  const cycleSpeed = () => {
    const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  const skip = (sec: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + sec));
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!seekBarRef.current || !audioRef.current) return;
    const rect = seekBarRef.current.getBoundingClientRect();
    audioRef.current.currentTime = (Math.max(0, Math.min(e.clientX - rect.left, rect.width)) / rect.width) * duration;
  };

  const formatTime = (sec: number) => {
    sec = Math.max(0, Math.floor(sec));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section className="relative h-screen w-screen overflow-hidden flex flex-col">
      <CloseButton />

      {/* Gradient background from pipeline-extracted color */}
      <div className="absolute inset-0 transition-colors duration-1000" style={{ background: `linear-gradient(160deg, ${gradientColor}, #0a0a0a)` }} />

      {/* Banner with gradient overlay */}
      {bannerUrl && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 opacity-30" style={{ backgroundImage: `url(${bannerUrl})` }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 30%, ${gradientColor})` }} />
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">

        {/* Carousel / Thumbnail area */}
        <div className="relative w-[320px] h-[180px] max-sm:w-[260px] max-sm:h-[146px] rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10 mb-6 transition-all duration-700">
          {activeCarouselUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700"
              style={{ backgroundImage: `url(${activeCarouselUrl})` }}
            />
          ) : (thumbnailUrl || bannerUrl) ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${thumbnailUrl || bannerUrl})`, opacity: loaded ? 1 : 0 }}
            />
          ) : null}
        </div>

        {/* Podcast name */}
        <p className="text-xl font-bold text-center text-white font-[family-name:var(--font-parkinsans)] max-w-lg mb-1 max-sm:text-base" style={{ opacity: loaded ? 1 : 0 }}>
          {podcastName}
        </p>

        {/* Speaker indicator */}
        {activeSpeaker && isPlaying && (
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full ${activeSpeaker === "female" ? "bg-pink-400" : "bg-blue-400"}`} />
            <span className="text-xs text-white/60 font-medium uppercase tracking-wider">
              {activeSpeaker === "female" ? "Liza" : "Lix"}
            </span>
          </div>
        )}

        {/* Live subtitle */}
        <div ref={subtitleRef} className="min-h-[60px] max-w-2xl px-4 mb-4 flex items-center justify-center">
          <p className="text-sm text-center text-white/70 leading-relaxed transition-opacity duration-300" style={{ opacity: activeSubtitle && isPlaying ? 1 : 0.3 }}>
            {activeSubtitle || (loaded ? "Press play to start" : "Loading...")}
          </p>
        </div>

        {/* Source */}
        {sourceLink && (
          <div className="mb-4">
            <SourcePill sourceLink={sourceLink} />
          </div>
        )}
      </div>

      {/* Carousel dots */}
      {carouselImages.length > 0 && (
        <div className="relative z-10 flex justify-center gap-1.5 mb-3">
          {carouselImages.map((img, i) => {
            const isActive = activeCarouselUrl === img.url;
            return <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive ? "bg-white scale-125" : "bg-white/30"}`} />;
          })}
        </div>
      )}

      {/* Playback controls */}
      <div className="relative z-10 px-6 pb-8 max-sm:pb-6">
        <div className="max-w-md mx-auto">
          {/* Seek bar */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-white/50 font-mono w-10 text-right">{formatTime(currentTime)}</span>
            <div ref={seekBarRef} onClick={seekTo} className="flex-1 h-1.5 rounded-full cursor-pointer relative" style={{ background: "rgba(255,255,255,0.15)" }}>
              <div className="absolute inset-y-0 left-0 rounded-full bg-white" style={{ width: `${percent}%` }} />
              <div className="absolute w-3 h-3 rounded-full bg-white -top-[3px] shadow" style={{ left: `calc(${percent}% - 6px)` }} />
            </div>
            <span className="text-xs text-white/50 font-mono w-10">{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-8">
            <button onClick={cycleSpeed} className="text-xs text-white/60 font-bold px-2 py-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer">{speed}x</button>
            <button onClick={() => skip(-10)} className="text-white/60 hover:text-white transition-colors cursor-pointer">
              <svg viewBox="0 0 24 24" className="w-6 h-6"><path d="M2.74999 2.5C2.33578 2.5 2 2.83579 2 3.25V8.75C2 9.16421 2.33578 9.5 2.74999 9.5H8.25011C8.66432 9.5 9.00011 9.16421 9.00011 8.75C9.00011 8.33579 8.66432 8 8.25011 8H4.34273C5.40077 6.60212 6.77033 5.4648 8.47169 4.93832C10.5381 4.29885 12.7232 4.35354 14.7384 5.10317C16.7673 5.85787 18.6479 7.38847 19.5922 9.11081C19.7914 9.47401 20.2473 9.607 20.6104 9.40785C20.9736 9.20871 21.1066 8.75284 20.9075 8.38964C19.7655 6.30687 17.5773 4.55877 15.2614 3.69728C12.9318 2.83072 10.4069 2.7693 8.02826 3.50536C6.14955 4.08673 4.65345 5.26153 3.49999 6.64949V3.25C3.49999 2.83579 3.1642 2.5 2.74999 2.5Z" fill="currentColor" /></svg>
            </button>
            <button onClick={togglePlay} className="w-14 h-14 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
              {isPlaying ? (
                <svg viewBox="0 0 32 32" className="w-6 h-6"><path d="M7.25 29C5.45507 29 4 27.5449 4 25.75V7.25C4 5.45507 5.45507 4 7.25 4H10.75C12.5449 4 14 5.45507 14 7.25V25.75C14 27.5449 12.5449 29 10.75 29H7.25ZM21.25 29C19.4551 29 18 27.5449 18 25.75V7.25C18 5.45507 19.4551 4 21.25 4H24.75C26.5449 4 28 5.45507 28 7.25V25.75C28 27.5449 26.5449 29 24.75 29H21.25Z" fill="#0a0a0a" /></svg>
              ) : (
                <svg viewBox="0 0 32 32" className="w-6 h-6 ml-1"><path d="M12.2246 27.5373C9.89137 28.8585 7 27.173 7 24.4917V7.50044C7 4.81864 9.89234 3.1332 12.2256 4.45537L27.2233 12.9542C29.5897 14.2951 29.5891 17.7047 27.2223 19.0449L12.2246 27.5373Z" fill="#0a0a0a" /></svg>
              )}
            </button>
            <button onClick={() => skip(10)} className="text-white/60 hover:text-white transition-colors cursor-pointer">
              <svg viewBox="0 0 24 24" className="w-6 h-6"><path d="M21.25 2.5C21.6642 2.5 22 2.83579 22 3.25V8.75C22 9.16421 21.6642 9.5 21.25 9.5H15.7499C15.3357 9.5 14.9999 9.16421 14.9999 8.75C14.9999 8.33578 15.3357 8 15.7499 8H19.6573C18.5992 6.60212 17.2297 5.4648 15.5283 4.93832C13.4619 4.29885 11.2768 4.35354 9.26156 5.10317C7.23271 5.85787 5.35214 7.38846 4.40776 9.11081C4.20861 9.47401 3.75274 9.607 3.38955 9.40785C3.02635 9.20871 2.89336 8.75283 3.09251 8.38964C4.23451 6.30687 6.42268 4.55877 8.73861 3.69728C11.0682 2.83072 13.5931 2.7693 15.9717 3.50536C17.8504 4.08673 19.3465 5.26153 20.5 6.64949V3.25C20.5 2.83579 20.8358 2.5 21.25 2.5Z" fill="currentColor" /></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
