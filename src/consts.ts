
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
               from Ukraine (Kiev), and now live in Ireland (Dublin). I am also a second-year \
               Computer Science student at DCU (Dublin City University). My \
               primary interests are programming (primarily Rust and C++), computer \
               science in general, mathematics, geopolitics, literature (both classical and \
               technical) and history.',
    },
    {
        id: 2,
        title: 'What am I currently doing?',
        body: 'I\'m preparing for the upcoming exams, reading `Rust for Rustaceans` and \
               `War and Peace` and preparing for the upcoming internship.',
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
        title: "MIT Mathematics",
        url: "https://mitsoul.org/courses/mit/course-18/",
        description: "Plan for obtain a degree in mathematics.",
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
        title: "Dr Trefor Playlist",
        url: "https://www.youtube.com/@DrTrefor/playlists",
        description: "A playlist of videos on various mathematical topics.",
      },
    ],
  },
  {
    id: 2,
    title: "Computer Sience",
    description: "Computer science courses, books, and other resources that I find useful.",
    items: [
      {
        title: "Computer Systems",
        url: "https://www.youtube.com/watch?v=Keducx5bp-g&list=PL0j-r-omG7i0-mnsxN5T4UcVS1Di0isqf&index=17",
        description: "A playlist of videos from zero from Barkeley on computer systems.",
      },
      {
        title: "Nand to Tetris",
        url: "https://www.nand2tetris.org",
        description: "Starting with basic logic gates and ending with a working computer."
      },
      {
        title: "Operating Systems Class",
        url: "https://pdos.csail.mit.edu/6.S081/2021/schedule.html",
        description: "MIT course on operating systems, working with XV6 OS."
      },
      {
        title: "Three Easy Pieces",
        url: "https://pages.cs.wisc.edu/~remzi/OSTEP/",
        description: "A book on operating systems, covering various topics in depth."
      },
      {
        title: "Computer Networking: A Top-Down Approach",
        url: "https://gaia.cs.umass.edu/kurose_ross/wireshark.php",
        description: "A book on computer networking, covering various topics in depth."
      },
    ]
  },
  {
    id: 3,
    title: "Interesting Articles/Projects",
    description: "Interesting articles and projects.",
    items: [
      {
        title: "Linux Device Drivers",
        url: "https://crescentro.se/posts/writing-drivers/",
        description: "An article on writing a basic Linux device driver."
      },
      {
        title: "Ray Tracing in One Weekend",
        url: "https://raytracing.github.io/books/RayTracingInOneWeekend.html",
        description: "A book on ray tracing, covering various topics in depth."
      },
    ]
  } 
];

export const socialLinks = [
    { name: 'GitHub', url: 'https://github.com/letv1nnn' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/artem-lytvyn-22694b348/' },
];
