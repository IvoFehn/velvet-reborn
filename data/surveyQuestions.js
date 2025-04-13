const surveyQuestions = [
  {
    id: "q26",
    text: "Lesbisch",
    description: "Die Frau hat geschlechtsverkehr mit einer anderen Frau.",
    category: "Homo",
    image:
      "https://photos.xgroovy.com/contents/albums/main/420x999/324000/324948/321757.jpg",
  },
  {
    id: "q26",
    text: "Schwul",
    description:
      "Die Frau ist mit geschlechtsverkehr zwischen ihrem Partner und einer gleichgeschlechtlichen Person einverstanden.",
    category: "Homo",
    image:
      "https://as1.ftcdn.net/v2/jpg/01/87/91/68/1000_F_187916831_BqM4LQbCrBJsG7Mi6s8iA75xH15UBAbC.jpg",
  },
  {
    id: "q27",
    text: "Transgender",
    description:
      "Die Frau oder der Mann haben geschlechtsverkehr mit einer Transgender-Person.",
    category: "Homo",
    image:
      "https://photos.xgroovy.com/contents/albums/sources/409000/409455/407855.jpg",
  },
  {
    id: "q40",
    text: "Rimming - Frau",
    description: "Der Mann befriedigt oral den Anus der Frau.",
    category: "Fetish",
    image:
      "https://godsofadult.com/wp-content/uploads/2019/10/Deep-Smother-Rimjob-Licking..jpg",
  },
  {
    id: "41",
    text: "Rimming - Mann",
    description: "Die Frau befriedigt oral den Anus des Mannes.",
    category: "Fetish",
    image:
      "https://photos.xgroovy.com/contents/albums/sources/620000/620593/671677.jpg",
  },
  {
    id: "q43",
    text: "Petplay",
    description: "Eine Person spielt gerne ein Tier.",
    category: "Fetish",
    image:
      "https://www.vice.com/wp-content/uploads/sites/2/2020/09/1599480065248-7vuyj7dg.jpeg?w=1440",
  },
  {
    id: "q44",
    text: "Ageplay",
    description:
      "Ageplay ist eine Form von Rollenspiel, bei der Erwachsene sich als jünger oder älter als sie selbst vorstellen",
    category: "Fetish",
    image:
      "https://www.allthingsassets.com/img/listings/lots-of-ageplay-vids-available-for-you-to-perv-over1726826123-66ed468bcd049.jpg",
  },
  {
    id: "q45",
    text: "Femdom",
    description: "Femdom bezeichnet eine dominante Frau im Bereich des BDSM",
    category: "Fetish",
    image:
      "https://photos.xgroovy.com/contents/albums/main/420x999/447000/447018/446548.jpg",
  },
  {
    id: "q46",
    text: "Atemkontrolle",
    description:
      "Breath control kann sich auf Atemkontrolle beim Singen, eine Sexualpraktik oder eine Atemkontrolltechnik beziehen",
    category: "Fetish",
    image:
      "https://photos.xgroovy.com/contents/albums/main/420x999/681000/681904/754546.jpg",
  },
  {
    id: "q47",
    text: "Penis und Hoden Tortur",
    description:
      "Unter Cock and Ball Torture oder abgekürzt CBT versteht man die sexuelle, lustvoll-schmerzliche Stimulation von Penis und Hodensack. Es ist eine einvernehmliche sexuelle Spielart des BDSM und keine Folter im ethischen Sinn.",
    category: "Fetish",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Public_ballbusting.jpg/1200px-Public_ballbusting.jpg",
  },
  {
    id: "q28",
    text: "Blowjob",
    description: "Die Frau befriedigt den Mann oral.",
    category: "Normal",
    image:
      "https://photos.xgroovy.com/contents/albums/main/420x999/612000/612322/660181.jpg",
  },
  {
    id: "q29",
    text: "Deepthroat",
    description:
      "Die Frau nimmt den Penis des Mannes vollständig in den Mund/Hals.",
    category: "Normal",
    image:
      "https://i.xgroovy.com/contents/videos_screenshots/222000/222791/preview.jpg",
  },
  {
    id: "q31",
    text: "Spermaspiele",
    description:
      "Die Frau geht spielerisch mit dem Sperma um. Sie nutzt es um es zu schlucken, sich damit einzureiben, es abzulecken oder sonstiges.",
    category: "Normal",
    image:
      "https://photos.xgroovy.com/contents/albums/main/420x999/452000/452493/452319.jpg",
  },
  {
    id: "q33",
    text: "Squirting",
    description:
      "Die Frau hat einen so intensiven Orgasmus, dass sie ejakuliert.",
    category: "Normal",
    image:
      "https://photos.xgroovy.com/contents/albums/main/420x999/436000/436928/435967.jpg",
  },
  {
    id: "q34",
    text: "Keine Unterwäsche",
    description: "Die Frau trägt keine Unterwäsche.",
    category: "Normal",
    image:
      "https://photos.xgroovy.com/contents/albums/main/420x999/180000/180745/176524.jpg",
  },
  {
    id: "q35",
    text: "Facial",
    description: "Die Mann ejakuliert der Frau in ihr Gesicht.",
    category: "Normal",
    image:
      "https://photos.xgroovy.com/contents/albums/main/420x999/797000/797759/922141.jpg",
  },
  {
    id: "q36",
    text: "Dessous",
    description: "Die Frau trägt Dessous.",
    category: "Normal",
    image:
      "https://photos.xgroovy.com/contents/albums/main/420x999/58000/58957/58951.jpg",
  },
  {
    id: "q37",
    text: "Toys",
    description: "In das Sexleben werden Spielzeuge mit integriert.",
    category: "Normal",
    image:
      "https://i0.wp.com/amantelilli.com/wp-content/uploads/2021/01/AmanteLilli-video-fuck-machine-test-auxfun-sexmachine-baise-robot-16.jpg?resize=800%2C450&ssl=1",
  },
  {
    id: "q38",
    text: "Dirty Talk",
    description:
      "Verbalerotik ist eine sexuelle Praktik und bezeichnet die Verwendung von erotisierenden oder anschaulichen und direkten Wörtern vor oder während des Geschlechtsverkehrs zur Erhöhung der sexuellen Stimulation.",
    category: "Normal",
    image:
      "https://hips.hearstapps.com/hmg-prod/images/how-to-dirty-talk-1561023851.jpg",
  },
  {
    id: "q39",
    text: "Masturbationsvoyeur",
    description: "Beim selbst machen zuschauen lassen.",
    category: "Normal",
    image:
      "https://photos.xgroovy.com/contents/albums/main/420x999/580000/580053/616031.jpg",
  },
  {
    id: "q21",
    text: "Fisting",
    description:
      "Der Mann versucht die Frau mit seiner Faust vaginal zu penetrieren.",
    category: "Hard",
    image:
      "https://photos.xgroovy.com/contents/albums/main/420x999/550000/550190/576335.jpg",
  },
  {
    id: "q21",
    text: "Anal-Fisting",
    description:
      "Der Mann versucht die Frau mit seiner Faust anal zu penetrieren.",
    category: "Hard",
    image:
      "https://photos.xgroovy.com/contents/albums/main/420x999/578000/578615/614113.jpg",
  },
  {
    id: "q1",
    text: "Gangbang",
    description:
      "Ein Gangbang ist eine sexuelle Handlung, bei der eine Person mit mehreren anderen Personen hintereinander und/oder gleichzeitig Geschlechtsverkehr hat.",
    category: "Herrenüberschuss",
    image:
      "https://cdn77-image.gtflixtv.com/VE6e3K5j8EFGzu91HRGzEw==,1989961200/8f73ea8a2d9960f12300c2d437f7253fa91da37b/1/2184/878/3/061.jpg?c=1&method=resize&f=jpg&w=420&height=236",
  },
  {
    id: "q2",
    text: "Cumtrain",
    description:
      "Viele Männer stehen in einer Schlange und haben nacheinander mit der Frau geschlechtverkehr.",
    category: "Herrenüberschuss",
    image:
      "https://cdn77-image.gtflixtv.com/0WnEHNqxBV6D-LOtybUULg==,1989961200/768f91f2f28eae67a43b683d96cc0dee38109679/1/6248/1660/3/197.jpg?c=1&method=resize&f=jpg&w=420&height=236",
  },
  {
    id: "q3",
    text: "Dreifachpenetration",
    description:
      "Vaginal-, Anal- und Oral-Penetration findet gleichzeitig statt.",
    category: "Herrenüberschuss",
    image:
      "https://cdn77-image.gtflixtv.com/CkXgztZ2Y-uqOQJjfaJ5VA==,1989961200/124a0f2a719ae5d0a18d07b3e12cf8d33ba15006/1/2036/1035/3/480.jpg?c=1&method=resize&f=jpg&w=420&height=236",
  },
  {
    id: "q4",
    text: "Spitroast",
    description:
      "Eine Frau wird von hinten und von vorne gleichzeiti penetriert.",
    category: "Herrenüberschuss",
    image:
      "https://photos.xgroovy.com/contents/albums/main/420x999/119000/119277/114974.jpg",
  },
  {
    id: "q5",
    text: "Free Use",
    description:
      "Beim ‚Free Use‘ ist die Dame sexuell frei verfügbar für alle Gäste. Häufig findet das Ganze in Form einer Party statt, bei der die Frau die Rolle der sexuellen Unterhalterin einnimmt. Die Männer können frei entscheiden, wann oder wie sie mit der Frau Geschlechtsverkehr haben. Oft ist die Frau auch den Abend über gefesselt und fixiert und wartet auf männlichen Besuch.",
    category: "Herrenüberschuss",
    image:
      "https://photos.xgroovy.com/contents/albums/sources/538000/538587/560861.jpg",
  },
  {
    id: "q6",
    text: "Bukkake / Blowbang",
    description:
      "Die Frau ist dabei von masturbierenden Männern umringt, welche ihr alle in das Gesicht ejakulieren werden. Häufig befriedigt sie nebenbei die Männer oral. Das Sperma wird gelegentlich gesammelt und und von der Frau verzehrt, auch wenn dies nicht immer der Fall ist",
    category: "Herrenüberschuss",
    image:
      "https://cdni.pornobilder.pics/300/1/195/80718475/80718475_015_7f2b.jpg",
  },
  {
    id: "q7",
    text: "Dreier zwei Männer",
    description:
      "Die Frau hat ganz üblichen Geschlechtverkehr mit zwei Männern. Die Praktiken oder Intensität wird häufig spontan bestimmt.",
    category: "Herrenüberschuss",
    image:
      "https://photos.xgroovy.com/contents/albums/sources/638000/638391/696194.jpg",
  },
  {
    id: "q8",
    text: "Partnertausch ohne Geschlechtsverkehr",
    description:
      "Zwei Paare habe Sex im gleichen raum und beobachten sich, jedoch findet kein paarübergreifender Geschlechtsverkehr statt. Jeder bleibt bei seinem Partner.",
    category: "Swinger",
    image:
      "https://img.freepik.com/free-photo/two-couples-kissing_23-2148518291.jpg",
  },
  {
    id: "q9",
    text: "Partnertausch mit Geschlechtsverkehr",
    description:
      "Zwei Paare haben in einem Raum gemeinsam miteinander Sex. Dabei ist der direkte Sexualpartner variabel. Häufig werden die Frauen getauscht oder aber auch die Frauen vollziehen Sexualpraktiken miteinander, falls Bi-Interesse vorhanden sein sollte.",
    category: "Swinger",
    image:
      "https://photos.xgroovy.com/contents/albums/main/420x999/886000/886381/1082759.jpg",
  },
  {
    id: "q10",
    text: "Partnertausch in getrennten Räumen",
    description:
      "Die Männer tauschen ihre Frauen und verbringen ein paar gemeinsame Stunden mit der Partnerin des jeweiligen anderen Paares allein.",
    category: "Swinger",
    image:
      "https://i.xgroovy.com/contents/videos_screenshots/205000/205838/608x342/1.jpg",
  },
  {
    id: "q12",
    text: "Dreier zwei Frauen - Fokus: Frau",
    description:
      "Hauptaugenmerk liegt hier auf den Frauen. Diese haben ungestört Sex miteinander. Der Mann übernimmt dabei den dominanten Part und nimmt sich einfach die begehrte Frau und macht mit ihr was er möchte, wenn er möchte.",
    category: "Frauenüberschuss",
    image:
      "https://photos.xgroovy.com/contents/albums/main/420x999/122000/122710/118408.jpg",
  },
  {
    id: "q13",
    text: "Dreier zwei Frauen - Fokus: Mann",
    description:
      "Die Frauen haben nur in soweit etwas miteinander zutun, wie es den Mann verführt, ansonsten stellen sie sich bereit für Sexpraktiken allein mit dem Mann.",
    category: "Frauenüberschuss",
    image:
      "https://photos.xgroovy.com/contents/albums/main/420x999/693000/693543/769822.jpg",
  },
  {
    id: "q14",
    text: "Reverse Gangbang",
    description:
      "Mehr als 2 Frauen die gleichzeitig untereinander Sex haben, jedoch hauptsächlich für den Mann da sind.",
    category: "Frauenüberschuss",
    image:
      "https://r2.vrporngalaxy.com/thumbnail/8a38ec400e243fedd9a3b361af5f861a/do-you-know-what-a-reverse-gangbang-is--6f82e03e95.jpg",
  },
  {
    id: "q14",
    text: "Bi-Sex mit Zuschauer",
    description:
      "Die beiden Frauen haben miteinander Sex. Der Mann übernimmt hierbei die passive Rolle und schaut nur zu. Häufig ist das ganze auch von Videoaufnahmen und Fotografien begleitet.",
    category: "Frauenüberschuss",
    image:
      "https://photos.xgroovy.com/contents/albums/sources/529000/529129/548883.jpg",
  },
  {
    id: "q15",
    text: "Cuckolding",
    description:
      "Die Frau wird an einen anderen Mann abgegeben, der dann den Geschlechtsverkehr mit ihr ausübt. Der Partner der Frau schaut dabei größtenteils nur zu, filmt oder fotografiert.",
    category: "Cuck",
    image: "https://cdn2.desiporn.su/deli/thumbs/70/803_enjoys-wifes-sharp.jpg",
  },
  {
    id: "q16",
    text: "Cuckquean",
    description:
      "Der Mann hat Geschlechtsverkehr mit einer anderen Frau. Die Frau des Partners schaut zu, ist nicht mit anwesend, filmt oder fotografiert.",
    category: "Cuck",
    image:
      "https://photos.xgroovy.com/contents/albums/sources/332000/332490/329511.jpg",
  },
  {
    id: "q17",
    text: "Outdoor",
    description:
      "Sex oder Nacktheit im freien. Meist etwas abgelegener bei dem man jedoch gesehen werden kann.",
    category: "Outdoor",
    image:
      "https://photos.xgroovy.com/contents/albums/main/420x999/58000/58310/58304.jpg",
  },
  {
    id: "q18",
    text: "FKK",
    description: "Nacktheit im Freien mit anderen Personen in der Umgebung.",
    category: "Outdoor",
    image:
      "https://photos.xgroovy.com/contents/albums/sources/232000/232700/228701.jpg",
  },
  {
    id: "q20",
    text: "Rollenspiele",
    description:
      "Das Paar schlüpft in ein Alterego und hat themenbasierten Sex.",
    category: "Rollenspiele",
    image:
      "https://photos.xgroovy.com/contents/albums/main/420x999/175000/175461/171229.jpg",
  },

  {
    id: "q48",
    text: "Needeling",
    description: "Der Mann nutzt Nadeln für den Lustschmerz.",
    category: "Fetish",
    image:
      "https://www.painsluts.org/outdoor-needle-pain/outdoor-needle-pain-02.jpg",
  },
  {
    id: "q49",
    text: "Filmen",
    description: "Sexuelle Handlungen filmen.",
    category: "Kamera",
    image:
      "https://st2.depositphotos.com/1104991/12094/i/450/depositphotos_120942260-stock-photo-man-taking-a-photo-with.jpg",
  },
  {
    id: "q50",
    text: "Fotografieren",
    description: "sexuelle Handlungen fotografieren.",
    category: "Kamera",
    image:
      "https://photos.xgroovy.com/contents/albums/main/420x999/539000/539658/562312.jpg",
  },
  {
    id: "q22",
    text: "Bondage",
    description:
      "Die Frau wird gefesselt und fixiert und ist dem Sex ausgeliefert.",
    category: "Bondage",
    image:
      "https://photos.xgroovy.com/contents/albums/main/420x999/611000/611717/659429.jpg",
  },
  {
    id: "q23",
    text: "BDSM",
    description:
      "Die Frau ist gefesselt und fixiert und wird nebenbei mit Lustschmerz verwöhnt.",
    category: "Bondage",
    image:
      "https://photos.xgroovy.com/contents/albums/main/420x999/560000/560883/590603.jpg",
  },
  {
    id: "q24",
    text: "Gloryhole",
    description:
      "Die Frau befindet sich hinter einer Wand oder an einem anderen abgeschiedenen Ort an dem lediglich ein Mann sein Geschlechtsteil zu ihr durchstecken kann. Die Frau verwöhnt den Mann dann mit Vaginal-, Anal- oder Oralsex. Häufig aber nicht immer beinhaltet diese Praktik auch fremde Männer.",
    category: "Bondage",
    image:
      "https://x.uuu.cam/pics/gloryholesecrets/raina-rae/xxxbeauty-clothed-feb/raina-rae-6.jpg",
  },
  {
    id: "q25",
    text: "Female-Gloryhole / Sexbox",
    description:
      "Die Frau befindet sich in einer Box oder einem Käfig bei dem sie nicht herausgucken und fixiert ist. Sie wird vom Mann der sich außerhalb befindet penetriert. Häufig aber nicht immer beinhaltet diese Praktik auch fremde Männer.",
    category: "Bondage",
    image:
      "https://preview.redd.it/playbox-ii-is-here-v0-po07qwdk7kgc1.jpeg?width=640&crop=smart&auto=webp&s=f051a0352a50a5e51774b6e400b83a234f15b52d",
  },
  {
    id: "q25",
    text: "Fixierung",
    description:
      "Die Frau wird an einem Gestellt so fixiert und gibt sich dem Sex hin.",
    category: "Bondage",
    image:
      "https://bdsmmobel.de/wp-content/uploads/2023/09/PADDED-BDSM-BENCH-1.jpg",
  },
];

export default surveyQuestions;
