
interface PersonalInfo {
    id: number,
    title: string,
    body: string,
}

export const personalData: PersonalInfo[] = [
    {
        id: 1,
        title: 'Me, my self-reflection and my articles',
        body: 'My name is Artem (Artem Lytvyn). I am 18 y.o., originally \
               from Ukraine, and now live in Ireland. I am also a second-year \
               Computer Science student at DCU (Dublin City University). My \
               primary interests are programming (primarily Rust and C++), computer \
               science in general, mathematics, geopolitics, literature (both classical and \
               technical), history, and philosophy.',
    },
    {
        id: 2,
        title: 'What am I currently doing?',
        body: 'I\'m preparing for the upcoming exams, constantly expanding my knowledge in \
               Rust and preparing for the upcoming internship.',
    },
    {
        id: 3,
        title: 'What\'s the point of this page/blog?',
        body: 'Primarily, I want to log my thoughts and reflections. \
               Additionally, I want to share my knowledge and insights on various topics.',
    },
];
type ResourceItem = {
  title: string;
  url: string;
  authors?: string[];
  description?: string;
};

type ResourceCategory = {
  id: number;
  title: string;
  description: string;
  items: ResourceItem[];
};

export const resourcesData: ResourceCategory[] = [
  {
    id: 1,
    title: "Mathematics",
    description: "Maths courses, books, and other resources that I find useful.",
    items: [
      {
        title: "MIT Math (Calculus / Linear Algebra)",
        url: "https://mitsoul.org/courses/mit/course-18/",
        description: "A comprehensive course on calculus and linear algebra.",
      },
      {
        title: "Harvard Stat 110 (Probability)",
        url: "https://stat110.hsites.harvard.edu",
        description: "An introduction to probability theory.",
      },
      {
        title: "Stanford Probability Playlist",
        url: "https://www.youtube.com/watch?v=2MuDZIAzBMY&list=PLoROMvodv4rOpr_A7B9SriE_iZmkanvUg",
        description: "A playlist of videos on probability theory.",
      },
      {
        title: "Eigensteve YouTube",
        url: "https://www.youtube.com/@Eigensteve/playlists",
        description: "A channel with tutorials on various mathematical topics.",
      },
      {
        title: "MIT Discrete Math (MCS Book)",
        url: "https://courses.csail.mit.edu/6.042/spring18/mcs.pdf",
        description: "A book on discrete mathematics.",
      },
      {
        title: "Dr Trefor Playlist",
        url: "https://www.youtube.com/@DrTrefor/playlists",
        description: "A playlist of videos on various mathematical topics.",
      },
    ],
  },
];

export const socialLinks = [
    { name: 'GitHub', url: 'https://github.com/letv1nnn' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/artem-lytvyn-22694b348/' },
    { name: 'LeetCode', url: 'https://leetcode.com/u/letv1n/' },
];
