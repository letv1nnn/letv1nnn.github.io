
interface PersonalInfo {
    id: number,
    title: string,
    body: string,
}

export const personalData: PersonalInfo[] = [
    {
        id: 1,
        title: 'Me, my self-reflection and my articles',
        body: 'My name is Artem (Artem Lytvyn). I am 18 y.o., originally ' +
              'from Ukraine (Kiev), and now live in Ireland (Dublin). I am also a second-year ' +
              'Computer Science student at DCU (Dublin City University). My ' +
              'primary interests are programming (primarily Rust and C++), computer ' +
              'science in general, mathematics, geopolitics, literature (both classical and ' +
              'technical) and history.',
    },
    {
        id: 2,
        title: 'What am I currently doing?',
        body: 'I recently started working at Red Hat as an intern. In addition, I am continuing ' +
              'to deepen my Rust expertise and expand my knowledge of modern software development tools and practices.',
    },
    {
        id: 3,
        title: 'What\'s the point of this page/blog?',
        body: 'Primarily, I want to log my thoughts and reflections. ' +
              'Additionally, I want to share my knowledge and insights on various topics.',
    },
];
export const socialLinks = [
    { name: 'GitHub', url: 'https://github.com/letv1nnn' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/artem-lytvyn-22694b348/' },
];
