
interface PersonalInfo {
    id: number,
    title: string,
    body: string,
    links?: { label: string, url: string }[],
}

export const personalData: PersonalInfo[] = [
    {
        id: 1,
        title: 'Me, my self-reflection and my articles',
        body: 'My name is Artem (Artem Lytvyn). I am 19 y.o., originally ' +
              'from Ukraine (Kiev), and now live in Ireland (Dublin). I am also a third-year ' +
              'Computer Science student at DCU (Dublin City University). My ' +
              'primary interests are programming (primarily Rust and C++), computer ' +
              'science in general, mathematics and literature (both classical and ' +
              'technical).',
    },
    {
        id: 2,
        title: 'What am I currently doing?',
        body: 'I am currently working on NVIDIA Openshell, an open source runtime for running AI agents safely in sandboxes, where I\'m also a reviewer. ' +
              'Alongside that, I came back to machine learning and am currently reading "Hands-On Machine Learning ' +
              'with Scikit-Learn, Keras, and TensorFlow". I\'m also actively playing chess and just dreaming.',
        links: [
            { label: 'NVIDIA Openshell', url: 'https://github.com/NVIDIA/OpenShell' },
        	{ label: 'reviewer', url: 'https://github.com/NVIDIA/OpenShell/blob/main/REVIEWERS.md'},
			{ label: '"Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow"', url: 'https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/'},
		],
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
    { name: 'Get in touch', url: 'mailto:artemlytvyn2007@gmail.com' },
];
