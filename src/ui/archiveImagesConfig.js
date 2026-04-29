// Archive images configuration
export const archiveImages = {
  mainScene: [

    // Optional citation fields per image:
    // citationUrl: 'https://example.com/source'
    // citationLabel: 'Library of Congress'
    // Existing `source` is also supported as a URL fallback.

    // ─── Scene 1: Precolonial Knowledge / Snowy Area (z=0 to z=-100) ───
    // Subtitles: land relations, governance through ceremony and song (z=0 to z=-70)
    {
      trigger: -20,
      src: './imgs/archive_imgs/circleOfLife_QavavauManumie.jpg',
      side: 'right',
      verticalOffset: '20%',
      alt: 'Circle of Life',
      title: 'Circle of Life',
      artist: 'Qavavau Manumie',
      medium: 'Drawing',
      source: 'https://nativecanadianarts.com/gallery/circle-of-life/',
      description: 'Drawing by Qavavau Manumie with hunters teaching the young that life is about respect and reciprocity. Respect animals and they will respect and provide when needed in return. Good respectful relationship with whales will preserve both continued survival.'
    },
    {
      trigger: -48,
      src: './imgs/archive_imgs/thuleCulture.jpg',
      side: 'left',
      verticalOffset: '30%',
      alt: 'Thule Culture artifacts',
      title: 'Thule Bow Drill Handle',
      medium: 'Drawing',
      source: 'https://katilvik.com/inuit-art-timeline/',
      description: 'Thule culture evidenced by bow-drill handle found near Arctic Bay, Baffin Island and swimming bird and birdwoman figurines found in the Eastern Arctic.'
    },
    {
      trigger: -60,
      src: './imgs/archive_imgs/ravenStealstheSun_PresontSingeltary.jpg',
      side: 'right',
      verticalOffset: '30%',
      alt: '',
      title: 'Raven Steals the Sun',
      artist: 'Preston Singeltary (Tlingit)',
      medium: 'Sculpture',
      source: 'https://www.prestonsingletary.com/commissions/detail/national-museum-of-the-american-indian-raven-steals-the-sun',
      description: 'The sculpture represents the tribe’s story about the origins of the celestial bodies, in which the trickster animal captures the sun, moon and stars from a greedy chief and releases them into the world. This account emphasizes the importance of oral history among Native American tribes like the Tlingit.'
    },


    // ─── Scene 2: Colonization / Forested Hills (z=-100 to z=-200) ───
    // Subtitles: Doctrine of Discovery, land seizure, boarding schools, cultural erasure (~z=-95 to z=-200)
    {
      trigger: -100,
      src: './imgs/archive_imgs/severedTies.png',
      side: 'left',
      verticalOffset: '50%',
      alt: 'Severed Ties',
      title: 'Severed Ties',
      artist: 'Avis Charley (Diné/Spirit Lake Dakota)',
      medium: 'Illustration',
      source: 'https://www.hcn.org/issues/51-17/',
      description: 'An original illustration by Spirit Dakota/Navajo artist Avis Charley from High Country News, depicting the severing of Indigenous ties to land and family through colonial policy, depicting the severing of Indigenous ties to land and family through colonial policy.'
    },
    {
      trigger: -120,
      src: './imgs/archive_imgs/nativeHostforWashingtonDC_EdgarHeapOfBirds.jpg',
      side: 'right',
      verticalOffset: '40%',
      alt: '',
      title: 'Native Host for Alaska',
      artist: 'Edgar Heap of Birds (Cheyenne/Arapaho)',
      source: 'https://www.nga.gov/exhibitions/land-carries-our-ancestors-contemporary-art-native-americans',
      description: 'Edgar Heap of Birds uses language as one of his primary mediums. Their work calls attention to what they call "a past that is no longer visible to us". As part of a larger series of signs across the country, this piece was installed in Alaska in 1988.'
    },
    {
      trigger: -130,
      src: './imgs/archive_imgs/mountainChief_Blackfeet.jpg',
      side: 'left',
      verticalOffset: '45%',
      alt: 'Mountain Chief, Blackfeet War Leader',
      title: 'Mountain Chief, Blackfeet War Leader',
      artist: 'Terrance Guardipee (Blackfeet)',
      medium: 'Mixed media collage',
      source: 'https://hoodmuseum.dartmouth.edu/objects/2008.60',
      description: 'A work of ledger art that layers vibrant Blackfoot imagery and the figure of the historic chief Mountain Chief atop a commercial Montana road map. An act of indigenous counter-mapping, reclaiming Blackfoot identity over the Western cartographic materials that once erased them.'
    },
    {
      trigger: -160,
      src: './imgs/archive_imgs/dancingAtPoplarRiver.jpg',
      side: 'right',
      verticalOffset: '45%',
      alt: 'Dancing at Poplar River',
      title: 'Dancing at Poplar River',
      artist: 'Darryl Growing Thunder (Assiniboine, Nakota)',
      medium: 'Colored Pencil and ink on ledger pages',
      source: 'https://hoodmuseum.dartmouth.edu/objects/2008.61',
      description: 'Ledger art drawn over repurposed historical payroll documents, depicting a traditional dance scene of the Assiniboine and Sioux peoples of the Fort Peck Reservation in Montana — living cultural tradition drawn on the very paper once used to administer reservation life.'
    },
    {
      trigger: -176,
      src: './imgs/archive_imgs/nativeHostforWashingtonDC_EdgarHeapOfBirds.jpg',
      side: 'right',
      verticalOffset: '40%',
      alt: 'Native Host sign',
      title: 'Native Host for Alaska',
      artist: 'Edgar Heap of Birds (Cheyenne/Arapaho)',
      source: 'https://www.nga.gov/exhibitions/land-carries-our-ancestors-contemporary-art-native-americans',
      description: 'Edgar Heap of Birds uses language as one of his primary mediums, calling attention to "a past that is no longer visible to us." Part of a larger series of signs installed across the country, this piece was installed in Alaska in 1988.'
    },
    {
      trigger: -191,
      src: './imgs/archive_imgs/stateNamesII_JaneQuickToSeeSmith.png',
      side: 'left',
      verticalOffset: '50%',
      alt: 'State Names II',
      title: 'State Names II',
      artist: 'Jane Quick-To-See Smith (Salish/Kootenai)',
      medium: 'Oil, collage and mixed media on canvas',
      source: 'https://americanart.si.edu/artwork/state-names-73858',
      description: 'Dripping paint and newspaper clippings obscure a map of North America. The only names left visible are those that stem from indigenous sources — the collaged layers acting as sequences of time, partially eclipsing the past while highlighting injustices endured by Native Americans throughout history.'
    },


    // ─── Scene 3: Resistance in Many Forms / Hilly Grassland (z=-200 to z=-300) ───
    // Subtitles: Red Cloud\'s War (-225), Ghost Dance (-252), Wounded Knee 1890 (-263),
    //            Alcatraz 1969 (-275), Trail of Broken Treaties 1972 (-290),
    //            Wounded Knee occupation 1973 (-305), Oka Crisis 1990 (-315)
    {
      trigger: -225,
      src: './imgs/archive_imgs/redCloud_War.jpg',
      side: 'left',
      verticalOffset: '20%',
      alt: 'Red Cloud war',
      title: 'The Indian Battle and Massacre near Fort Philip Kearney',
      artist: 'Library of Congress Prints and Photographs Division',
      source: 'https://www.loc.gov/pictures/item/2001700334/',
      description: 'Large group of Native Americans on horseback surrounding United States Army soldiers. Illus. in: Harpers Weekly, v. 11, no. 534 (1867 March 23), p. 180.'
    },
    {
      trigger: -238,
      src: './imgs/archive_imgs/ghostDanceDrum_1890s.jpg',
      side: 'right',
      verticalOffset: '25%',
      alt: 'Ghost Dance Drum',
      title: 'Ghost Dance Drum',
      artist: 'George Beaver',
      medium: 'Artifact photograph',
      source: 'https://www.worldhistory.org/image/18059/ghost-dance-drum/',
      description: 'A rare artifact from the Ghost Dance movement made by George Beaver (Chahiksichahiks). The Ghost Dance was a pan-Indigenous spiritual movement in the 1880s–90s preaching the peaceful end of colonial rule and the restoration of Indigenous land and life.'
    },
    {
      trigger: -252,
      src: './imgs/archive_imgs/ghostDance.jpg',
      side: 'right',
      verticalOffset: '25%',
      alt: 'Ghost Dance',
      title: 'Ghost Dance',
      artist: 'Frederic Remington',
      medium: 'Historical photograph',
      source: 'https://www.theatlantic.com/books/archive/2022/12/native-american-history-indigenous-continent-pekka-hamalainen/672600/',
      description: 'The Ghost Dance as vision and renewal, a movement the US government feared enough to answer with massacre.'
    },
    {
      trigger: -253,
      src: './imgs/archive_imgs/alcatraz.jpg',
      side: 'left',
      verticalOffset: '30%',
      alt: 'Alcatraz occupation',
      title: 'Indian occupiers moments after their removal from Alcatraz',
      artist: 'Ilka Hartmann',
      medium: 'Documentary photograph',
      source: 'https://thenaturalhistorymuseum.org/events/the-occupation-of-alcatraz/',
      description: 'On Nov. 20, 1969, 78 Indians landed on Alcatraz Island in San Francisco Bay and occupied the island. They called themselves "Indians of All Tribes" and issued a proclamation, "We Hold the Rock." Left: Oohosis, Cree from Canada. Right: Peggy Lee Ellenwood, Sioux from Wolf Point, Montana.'
    },
    {
      trigger: -263,
      src: './imgs/archive_imgs/AMI_CrowDog.jpg',
      side: 'right',
      verticalOffset: '30%',
      alt: 'American Indian Movement',
      title: 'Moment from American Indian Movement',
      artist: 'American Indian Movement',
      medium: 'Movement photograph',
      source: 'https://americanindian.si.edu/collections-search/edan-record/ead_collection%3Asova-nmai-ac-449',
      description: 'The American Indian Movement, also known as AIM, was founded in July 1968 in Minneapolis, Minnesota by Dennis Banks, Clyde Bellecourt, Vernon Bellecourt, and Russell Means. The civil rights group focused on the violence, discrimination, and poverty faced by American Indians as well as larger tribal issues including treaty rights and cultural preservation. This image portrays AIM Leonard Crow Dog, Dennis Banks, Leonard Peltier, and John Trudell.'
    },
    {
      trigger: -275,
      src: './imgs/archive_imgs/pbs_woundedknee.jpg',
      side: 'left',
      verticalOffset: '35%',
      alt: 'Wounded Knee',
      title: 'We Shall Remain: Wounded Knee',
      artist: 'Archival source',
      medium: 'Documentary photograph',
      source: 'https://www.pbs.org/wgbh/americanexperience/films/weshallremain/',
      description: 'Protesters on the Pine Ridge Indian Reservation.'
    },
    {
      trigger: -287,
      src: './imgs/archive_imgs/LongestWalk.jpg',
      side: 'right',
      verticalOffset: '30%',
      alt: 'The Longest Walk',
      title: 'The Longest Walk (1978)',
      artist: 'American Indian Movement',
      medium: 'Archival photograph',
      source: 'https://www.zinnedproject.org/news/tdih/longest-walk-ends/',
      description: 'The Longest Walk was a five month march from San Francisco, CA to Washington, D.C that took place in 1978 in protest of legislation that would revoke treaties, limit native american rights, and greatly decrease access to social services.'
    },
    {
      trigger: -297,
      src: './imgs/archive_imgs/mohawkOkaCrisis.jpg',
      side: 'left',
      verticalOffset: '40%',
      alt: 'Oka Crisis',
      title: 'Group of Mohawk warriors during the Oka Crisis',
      artist: 'Canadian Encyclopedia',
      medium: 'Archival photograph',
      source: 'https://www.thecanadianencyclopedia.ca/en/article/oka-crisis',
      description: 'The Oka Crisis as an assertion of the Kanesatake Mohawk sovereignty and title, distinct in its legal and territorial grounding from other resistance movements. The photo depicts a group of Mohawk warriors cheering.'
    },

    // Scene 4 - Hemispheric / Mountain Pass (z=-300 to z=-400)
    { 
      trigger: -305,
      src: './imgs/archive_imgs/dickBancroftUN2.jpg',
      side: 'left',
      verticalOffset: '20%',
      alt: '', 
      title: '1977 UN Geneva Conference, Photo 1',
      artist: 'Dick Bancroft',
      medium: 'Archival photograph',
      source: 'https://alleynews.org/2018/10/1977-un-geneva-conference-dick-bancroft-champion-with-a-camera/',
      description: "Ted Means, Pat Bellanger, and Bill Wahpepah standing at the podium where speeches and over a hundred testimonies of abuse and exploitation were given at the 1977 UN Geneva Conference."
    }, 


    { 
      trigger: -310,
      src: './imgs/archive_imgs/dickBancroftUN.jpg',
      side: 'left',
      verticalOffset: '20%',
      alt: '', 
      title: '1977 UN Geneva Conference, Photo 2',
      artist: 'Dick Bancroft',
      medium: 'Archival photograph',
      source: 'https://alleynews.org/2018/10/1977-un-geneva-conference-dick-bancroft-champion-with-a-camera/',
      description: "These men photographed and documented by Dick Bancroft are a few of the many representatives attending the 1977 UN Geneva Conference. Left to right Ted Means, Greg Zephier, Russell Means, Oren R. Lyons, Jr., Larry Red Shirt, and Francis Andrew He Crow"
    }, 

    {
      trigger: -315,
      src: './imgs/archive_imgs/zapatista.png',
      side: 'right',
      verticalOffset: '30%',
      alt: 'Zapatista uprising',
      title: 'Zapatista Uprising, 1994',
      artist: 'Gerardo Magallon / AFP via Getty Images',
      medium: 'Archival photograph',
      source: 'https://therealnews.com/1994-zapatista-mexico-uprising-resisting-nafta-corporate-capitalism',
      description: 'Zapatista National Liberation Army (EZLN) guerilleros stand, on January 03, 1994 in Altamira, Chiapas. Chiapas EZLN rebels launched a rebellion in January 1994 to end government oppression of Indigenous people.'
    },

    {
      trigger: -348,
      src: './imgs/archive_imgs/DefendTheSacre.png',
      side: 'right',
      verticalOffset: '35%',
      alt: 'Defend the Sacred at Standing Rock',
      title: 'Defend the Sacred at Standing Rock',
      medium: 'Archival Image',
      source: 'https://news.asu.edu/20201119-discoveries-asu-project-humanities-indigenous-environmentalism-activism',
      description: 'Native Americans march to a sacred burial ground site that was disturbed by bulldozers building the Dakota Access Pipeline in North Dakota, where hundreds of people have gathered to join the Standing Rock Sioux Tribe\'s protest.'
    },
    {
      trigger: -362,
      src: './imgs/archive_imgs/standingrock_calexandra_nov24_28.png',
      side: 'left',
      verticalOffset: '25%',
      alt: 'Standing Rock water protectors',
      title: 'Protestors at Standing Rock Reservation',
      artist: 'Cassi Alexandra for NPR',
      medium: 'Archival Image',
      source: 'https://www.nativeamericacalling.com/friday-july-21-2017-continuing-fight-dakota-access-pipeline/',
      description: 'Protesters gather at Standing Rock Reservation on Thanksgiving Day to build a bridge to Turtle Island, which they consider sacred ground. Police are seen lining the island hill beyond them.'
    },
    {
      trigger: -375,
      src: './imgs/archive_imgs/arcticClimateChangeProtest.jpg',
      side: 'right',
      verticalOffset: '40%',
      alt: 'NoDAPL crowd closeup',
      title: 'Keep It In the Ground Letter Delivery',
      artist: 'Suchat Pederson',
      medium: 'Archival Image',
      source: 'https://www.flickr.com/photos/rainforestactionnetwork/21457484881/',
      description: 'Allison Warden from Alaska speaks at a press conference in front of the White House as a coalition of more than 400 organizations and leaders deliver a historic letter to the White House on Tuesday calling on President Obama to stop new federal fossil fuel leasing on public lands and oceans in the United States.'
    },

    // Scene 5 - Maya Q\'eqchi\' and El Estor / Ocean (z=-400 to z=-600)
    {
      trigger: -468,
      src: '',
      side: 'left',
      verticalOffset: '40%',
      alt: 'Lake Izabal',
      title: 'Protestors in El Estor, Guatemala',
      artist: 'Baudilio Choc for Radio Victoria',
      medium: 'Landscape photograph',
      source: 'https://www.guatemalasolidarityproject.org/resistance-to-fenix-mine/',
      description: 'Protestors in El Estor carry a banner that reads: “when will we have a just and equitable government? Every government has always favored the interests of the rich. For us, the indigenous Mayas, we have always been massacred and martyred only to please the foreigners.” Police later used tear gas to put down the protest.'
    },
    {
      trigger: -482,
      src: 'imgs/archive_imgs/protestors_Guatemala.png',
      side: 'right',
      verticalOffset: '35%',
      alt: 'Fenix mine aerial',
      title: 'Protest Against Guatemalan President Alejandro Giammatei',
      artist: 'AFP',
      medium: 'Archival Image',
      source: 'https://www.swissinfo.ch/eng/business/swiss-mining-project-protest-triggers-regional-curfew-in-guatemala/47055280',
      description: 'Protestors in Guatemala City demanding the resignation of President Alejandro Giammattei on October 20, 2021.'
    },
    {
      trigger: -502,
      src: 'imgs/hack/el_estorProtest1.png',
      side: 'left',
      verticalOffset: '50%',
      alt: 'Protestors in El Estor, Guatemala',
      title: 'Protestors in El Estor, Guatemala',
      artist: 'Nelton Rivera for Prensa Comunitaria',
      medium: 'Archival Photograph',
      source: 'https://theintercept.com/2022/03/27/solway-guatemala-nickel-mine/',
      description: 'Police crack down on protesters blocking mine vehicles in El Estor, Guatemala, in October 2021.'
    },
    {
      trigger: -532,
      src: 'imgs/hack/image.png',
      side: 'right',
      verticalOffset: '30%',
      alt: 'Paulina Coc listens to Community Development Council leaders at a San Jorge neighborhood assempbly',
      title: 'Community Assembly in San Jorge',
      artist: 'Sandra Cuffee',
      medium: 'Archival Photograph',
      source: 'https://theintercept.com/2022/03/27/solway-guatemala-nickel-mine/',
      description: 'Paulina Coc, member of Maya Q\'eqchi\' community, listens to Community Development Council leaders at a San Jorge neighborhood assembly in El Estor, Guatemala, on Jan. 23, 2022'
    },
    {
      trigger: -562,
      src: 'imgs/hack/FotoEstor.png',
      side: 'right',
      verticalOffset: '30%',
      alt: 'Additional photo of armed protest in El Estor, Guatemala',
      title: 'Community Leaders in El Estor',
      artist: 'Maya Pocomam',
      medium: 'Archival Photograph',
      source: 'https://www.culturalsurvival.org/news/repression-indigenous-community-leaders-continues-el-estor-guatemala',
      description: 'Maya Q\'eqchi\' community leaders in El Estor, Guatemala, stand together in solidarity and to discuss the repression they face at the hands of the Fenix Nickel Mine and the Guatemalan government.'
    },
    {
      trigger: -582,
      src: 'imgs/archive_imgs/fotoEstor2.png',
      side: 'right',
      verticalOffset: '45%',
      alt: 'Community meeting in El Estor, Guatemala',
      title: 'Community meeting in El Estor, Guatemala',
      artist: 'Archival source',
      medium: 'Archival Photograph',
      source: 'https://www.culturalsurvival.org/news/repression-indigenous-community-leaders-continues-el-estor-guatemala',
      description: 'Members of the Maya Q\'eqchi\' community in El Estor, Guatemala, gather for a community meeting.'
    },

    // Scene 6 - Guacamaya / Tropical Rainforest (z=-500 to z=-600)
    // These images reveal as the user moves through the late part of Scene 6
    {
      trigger: -548,
      src: './imgs/hack/hack_back.jpg',
      side: 'left',
      verticalOffset: '40%',
      alt: 'Corporate extraction infrastructure',
      title: 'Guacamaya\'s Online Guide to Hacking',
      artist: 'Guacamaya',
      medium: 'Website',
      source: 'https://enlacehacktivista.org/index.php/Extractivist_Leaks/es',
      description: 'Cover page of online tutorial created by Guacamaya demonstrating how they breached the networks of Pronico and CGN, the two companies responsible for the Fenix mine and its violence. The guide is a tool for other activists and land defenders to use hacking as a means of resistance.'
    },
    {
      trigger: -562,
      src: 'imgs/hack/wakamaya.png',
      side: 'right',
      verticalOffset: '35%',
      alt: 'Guacamaya leak documents',
      title: 'Guacamaya (Parrot) Illustration',
      artist: 'Guacamaya',
      medium: 'Illustration',
      source: 'https://enlacehacktivista.org/index.php/Extractivist_Leaks/es',
      description: 'Illustration of a parrot hacking produced by followers of the Guacamaya collective.'
    },

    {
      trigger: -574,
      src: 'imgs/hack/Fin_dela_mina.png',
      side: 'left',
      verticalOffset: '35%',
      alt: 'Fin de la Mina Illustration',
      title: 'Fin de la Mina Illustration',
      artist: 'Guacamaya',
      medium: 'Illustration',
      source: 'https://enlacehacktivista.org/index.php/Extractivist_Leaks/es',
      description: 'Illustration representing the end of the mine and ongoing environmental destruction.'
    },

    {
      trigger: -586,
      src: 'imgs/hack/Fin_dela_milicia.png',
      side: 'right',
      verticalOffset: '35%',
      alt: 'Fin de la Milicia Illustration',
      title: 'Fin de la Milicia Illustration',
      artist: 'Guacamaya',
      medium: 'Illustration',
      source: 'https://enlacehacktivista.org/index.php/Extractivist_Leaks/es',
      description: 'Illustration representing the end of the militia and ongoing settler colonialism.'
    },

    // Scene 7 - Dark Hack Corridor (z=-700 onwards)
    // Scene 7 uses hack scene imagery on walls.
    // If adding floating images, they should feel like memory surfacing:
    // a face, a river, a dance, a march. Not documentation. Presence.
  ]
};
