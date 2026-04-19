
export interface article {
    id: number,
    title: string,
    body: string,
} 

export const personalData: article[] = [
    {
        id: 1,
        title: 'Me, my self-reflection and my articles',
        body: 'My name is Artem (Artem Lytvyn). I am 18 years old, originally \
               from Ukraine, and now live in Ireland. I am also a second-year \
               Computer Science student at DCU (Dublin City University). My \
               primary interests are programming (primarily Rust and C++), Computer \
               Science in general, geopolitics, literature (both classical and \
               technical), history, and philosophy.',
    }
];
