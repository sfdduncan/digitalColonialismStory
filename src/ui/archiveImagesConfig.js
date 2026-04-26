// Archive images configuration
export const archiveImages = {
  mainScene: [

    // Optional citation fields per image:
    // citationUrl: 'https://example.com/source'
    // citationLabel: 'Library of Congress'
    // Existing `source` is also supported as a URL fallback.

    // Scene 1 - Precolonial Knowledge / Snowy Area (z=0 to z=-100)
    {
      trigger: -20,
      src: './imgs/archive_imgs/arctic_precolonial.jpg',
      side: 'left',
      verticalOffset: '20%',
      alt: 'Arctic precolonial landscape',
      title: 'SUGGESTION: Inuit or Alaska Native people actively on the land, traveling, fishing, or in ceremony. People in relation to place, not empty landscape.',
      artist: 'Archival source',
      medium: 'Historical landscape photograph',
      source: 'https://example.com/citation/trigger--20',
      description: 'An expansive Arctic view that frames the land before colonial extraction reshaped the region and its relationships to place.'
    },
    {
      trigger: -40,
      src: './imgs/archive_imgs/HudsonRiver_Precolonial.jpg',
      side: 'right',
      verticalOffset: '30%',
      alt: 'Hudson River precolonial',
      title: 'SUGGESTION: Indigenous peoples in active relation to a river or waterway. The water as kin, not resource.',
      artist: 'Archival source',
      medium: 'Historical landscape image',
      source: 'https://example.com/citation/trigger--40',
      description: 'A river landscape presented as part of a world that predates colonial mapping, ownership, and industrial transformation.'
    },
    {
      trigger: -60,
      src: './imgs/archive_imgs/precolonial_nature.jpg',
      side: 'left',
      verticalOffset: '40%',
      alt: 'Precolonial nature',
      title: 'SUGGESTION: Indigenous agricultural practice or land stewardship. Knowledge as land management, people as caretakers of specific ecologies.',
      artist: 'Archival source',
      medium: 'Historical environmental photograph',
      source: 'https://example.com/citation/trigger--60',
      description: 'Dense, living ecologies appear here as a reminder that land held memory, kinship, and governance long before settler narratives.'
    },

    // Scene 2 - Colonial Disruption / Forest Area (z=-100 to z=-200)
    {
      trigger: -110,
      src: './imgs/archive_imgs/colonial_1.jpg',
      side: 'right',
      verticalOffset: '35%',
      alt: 'Colonial era image 1',
      title: 'SUGGESTION: Colonial-era land survey, map, or Doctrine of Discovery document. The bureaucratic machinery of dispossession made visible.',
      artist: 'Archival source',
      medium: 'Colonial-era photograph',
      source: 'https://example.com/citation/trigger--110',
      description: 'A documentary fragment from the colonial period, held here as evidence of how conquest was recorded and normalized visually.'
    },
    {
      trigger: -130,
      src: './imgs/archive_imgs/80sResidentialSchoolProtest.jpeg',
      side: 'left',
      verticalOffset: '50%',
      alt: 'Colonial era image 2',
      title: 'SUGGESTION: Residential/boarding school exterior or classroom. Aligns with the subtitle about punishing children for speaking their languages.',
      artist: 'Archival source',
      medium: 'Colonial-era photograph',
      source: 'https://example.com/citation/trigger--130',
      description: 'Another colonial image that extends the archive of occupation, categorization, and imposed order across Indigenous land.'
    },
    {
      trigger: -150,
      src: './imgs/archive_imgs/Missouri_Colonial.jpg',
      side: 'right',
      verticalOffset: '45%',
      alt: 'Missouri colonial',
      title: 'SUGGESTION: Indigenous community continuing ceremony or daily life during the colonial period. Survival as the counter-image to the school and the map.',
      artist: 'Archival source',
      medium: 'Historical documentary image',
      source: 'https://example.com/citation/trigger--150',
      description: 'This image marks the Missouri region within a wider geography of settlement, extraction, and displacement.'
    },
    {
      trigger: -170,
      src: './imgs/archive_imgs/spain_colonial_freeWomen.jpg',
      side: 'left',
      verticalOffset: '30%',
      alt: 'Spanish colonial free women',
      title: 'SUGGESTION: Indigenous women in collective life under colonial conditions. Everyday persistence as political act.',
      artist: 'Archival source',
      medium: 'Historical photograph reproduction',
      source: 'https://example.com/citation/trigger--170',
      description: 'A colonial-era image that points to gendered lives and constrained forms of autonomy inside imperial systems.'
    },

    // Scene 3 - Resistance in Many Forms / Hilly Grassland (z=-200 to z=-300)
    {
      trigger: -225,
      src: './imgs/archive_imgs/redCloud_War.jpg',
      side: 'left',
      verticalOffset: '20%',
      alt: 'Red Cloud war',
      title: 'The Indian Battle and Massacre near Fort Philip Kearney',
      artist: 'Harper Weekly',
      source: 'https://loc.getarchive.net/media/the-indian-battle-and-massacre-near-fort-philip-kearney-dacotah-sic-territory',
      citationLabel: 'Library of Congress / GetArchive',
      description: 'Large group of Native Americans on horseback surrounding United States Army soldiers. Illus. in: Harperweekly, v. 11, no. 534 (1867 March 23), p. 180.'
    },
    {
      trigger: -240,
      src: './imgs/archive_imgs/ghostDance.jpg',
      side: 'right',
      verticalOffset: '25%',
      alt: 'Ghost Dance',
      title: 'Ghost Dance',
      artist: 'Frederic Remington',
      medium: 'Historical photograph or illustration',
      source: 'https://example.com/citation/trigger--240',
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
      source: 'https://example.com/citation/trigger--253',
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
      source: 'https://example.com/citation/trigger--263',
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
      medium: 'News photograph',
      source: 'https://example.com/citation/trigger--275',
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
      medium: 'Documentary photograph',
      source: 'https://example.com/citation/trigger--287',
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
      source: 'https://example.com/citation/trigger--297',
      description: 'The Oka Crisis as an assertion of Mohawk sovereignty and title, distinct in its legal and territorial grounding from other resistance movements. The photo depicts a group of Mohawk warriors cheering.'
    },

    // Scene 4 - Hemispheric / Mountain Pass (z=-300 to z=-400)
    {
      trigger: -315,
      src: './imgs/archive_imgs/zapatista.png',
      side: 'right',
      verticalOffset: '30%',
      alt: 'Zapatista uprising',
      title: 'SUGGESTION: Zapatista autonomous community life: school, cooperative, mural. Resistance as governance and institution, not only uprising.',
      artist: 'Archival source',
      medium: 'Movement image',
      source: 'https://example.com/citation/trigger--315',
      description: 'A visual link to anti-colonial organizing in Chiapas and the global circulation of Indigenous and autonomous struggle.'
    },
    {
      trigger: -330,
      src: './imgs/archive_imgs/keystone_xl.jpg',
      side: 'left',
      verticalOffset: '45%',
      alt: 'Keystone XL protest',
      title: 'SUGGESTION: Indigenous-led legislative testimony or legal filing against Keystone XL. The courtroom as a front of resistance.',
      artist: 'Archival source',
      medium: 'Protest photograph',
      source: 'https://example.com/citation/trigger--330',
      description: 'The image traces environmental defense and land protection movements confronting extractive infrastructure.'
    },
    {
      trigger: -348,
      src: './imgs/archive_imgs/DefendTheSacred.png',
      side: 'right',
      verticalOffset: '35%',
      alt: 'Defend the Sacred at Standing Rock',
      title: 'Defend the Sacred at Standing Rock',
      medium: 'Archival Image',
      source: 'https://example.com/citation/trigger--348',
      description: 'Native Americans march to a sacred burial ground site that was disturbed by bulldozers building the Dakota Access Pipeline in North Dakota, where hundreds of people have gathered to join the Standing Rock Sioux Tribe\'s protest.'
    },
    {
      trigger: -362,
      src: './imgs/archive_imgs/DAPL_Sioux.jpg',
      side: 'left',
      verticalOffset: '25%',
      alt: 'Standing Rock water protectors',
      title: 'SUGGESTION: Water protectors on horseback or in ceremony at Standing Rock. Resistance as prayer, not just protest.',
      artist: 'Archival source',
      medium: 'Documentary protest photograph',
      source: 'https://example.com/citation/trigger--362',
      description: 'A scene from Standing Rock that foregrounds collective refusal, ceremony, and defense of water.'
    },
    {
      trigger: -375,
      src: './imgs/archive_imgs/nodapl_crowd_closeup.jpg',
      side: 'right',
      verticalOffset: '40%',
      alt: 'NoDAPL crowd closeup',
      title: 'SUGGESTION: Drumming or singing at Standing Rock. Sound as resistance, the encampment as a living community.',
      artist: 'Archival source',
      medium: 'Documentary protest photograph',
      source: 'https://example.com/citation/trigger--375',
      description: 'A close view of collective presence within the NoDAPL movement, emphasizing scale, solidarity, and urgency.'
    },
    {
      trigger: -390,
      src: '',
      side: 'left',
      verticalOffset: '35%',
      alt: 'UN Indigenous delegates',
      title: 'SUGGESTION: Indigenous delegates at the United Nations, 1977 or UNDRIP passage 2007. Sovereignty asserted in an international forum.',
      artist: 'Archival source',
      medium: 'Documentary photograph',
      source: 'https://example.com/citation/trigger--390',
      description: 'Indigenous delegates bringing centuries of articulated demand to an international stage.'
    },

    // Scene 5 - Maya Q\'eqchi\' and El Estor / Ocean (z=-400 to z=-600)
    {
      trigger: -468,
      src: '',
      side: 'left',
      verticalOffset: '40%',
      alt: 'Lake Izabal',
      title: 'SUGGESTION: Lake Izabal, Guatemala. The specific body of water the Maya Q\'eqchi\' people have lived alongside and that the mine has threatened.',
      artist: 'Archival source',
      medium: 'Landscape photograph',
      source: 'https://example.com/citation/trigger--468',
      description: 'Lake Izabal as the living territory at the center of the Maya Q\'eqchi\' land defense this documentary is grounded in.'
    },
    {
      trigger: -482,
      src: '',
      side: 'right',
      verticalOffset: '35%',
      alt: 'Fenix mine aerial',
      title: 'SUGGESTION: Aerial of the Fenix nickel mine open pit on Maya Q\'eqchi\' land. The wound in the territory the subtitles are describing.',
      artist: 'Archival source',
      medium: 'Aerial photograph',
      source: 'https://example.com/citation/trigger--482',
      description: 'The Fenix mine as physical fact on Maya Q\'eqchi\' territory, inseparable from the history of what it took to build it.'
    },
    {
      trigger: -502,
      src: '',
      side: 'left',
      verticalOffset: '50%',
      alt: 'Panzós massacre',
      title: 'SUGGESTION: Documentary image or memorial related to the Panzós massacre, May 29 1978. 700 people marched. At least 140 were killed.',
      artist: 'Archival source',
      medium: 'Documentary photograph',
      source: 'https://example.com/citation/trigger--502',
      description: 'The Panzós massacre as a direct consequence of resistance to the Fenix mine and land dispossession in El Estor.'
    },
    {
      trigger: -522,
      src: '',
      side: 'right',
      verticalOffset: '30%',
      alt: 'Maya Q\'eqchi\' community organizing',
      title: 'SUGGESTION: Maya Q\'eqchi\' community assembly or gathering in El Estor. Collective organizing as the form of resistance surrounding the lawsuits.',
      artist: 'Archival source',
      medium: 'Documentary photograph',
      source: 'https://example.com/citation/trigger--522',
      description: 'Community assembly as one of many forms of resistance the Maya Q\'eqchi\' people sustained through each iteration of the mine\'s ownership.'
    },
    {
      trigger: -542,
      src: '',
      side: 'left',
      verticalOffset: '55%',
      alt: 'Adolfo Ich',
      title: 'SUGGESTION: Adolfo Ich, community leader and teacher killed September 27 2009. A face, a name, the human cost the subtitles are naming.',
      artist: 'Archival source',
      medium: 'Portrait photograph',
      source: 'https://example.com/citation/trigger--542',
      description: 'Adolfo Ich Chamán, murdered in front of his family by mine security personnel. One of three cases brought against Hudbay in Canadian courts.'
    },
    {
      trigger: -562,
      src: '',
      side: 'right',
      verticalOffset: '45%',
      alt: 'Hudbay lawsuits',
      title: 'SUGGESTION: Canadian court filing or headline related to Caal v. Hudbay, Choc v. Hudbay, or Chub v. Hudbay. Legislation as resistance.',
      artist: 'Archival source',
      medium: 'Documentary image',
      source: 'https://example.com/citation/trigger--562',
      description: 'The three lawsuits brought against Hudbay Minerals, the first time a Canadian corporation faced Canadian courts for the actions of its overseas subsidiaries.'
    },

    // Scene 6 - Guacamaya / Tropical Rainforest (z=-600 to z=-700)
    {
      trigger: -602,
      src: '',
      side: 'left',
      verticalOffset: '40%',
      alt: 'Corporate extraction infrastructure',
      title: 'SUGGESTION: Server farm, corporate communications infrastructure, or mining company HQ. The digital face of the same extractive logic.',
      artist: 'Archival source',
      medium: 'Documentary photograph',
      source: 'https://example.com/citation/trigger--602',
      description: 'The corporate and digital infrastructure through which colonial extraction now coordinates itself.'
    },
    {
      trigger: -622,
      src: '',
      side: 'right',
      verticalOffset: '35%',
      alt: 'Guacamaya leak documents',
      title: 'SUGGESTION: Redacted or partially visible document from the Guacamaya leaks. What was hidden, now exposed.',
      artist: 'Archival source',
      medium: 'Documentary image',
      source: 'https://example.com/citation/trigger--622',
      description: 'The breach as act of witness, making visible the surveillance and coordination of violence the corporate infrastructure had been designed to hide.'
    },
    {
      trigger: -645,
      src: '',
      side: 'left',
      verticalOffset: '50%',
      alt: 'Land defender with phone',
      title: 'SUGGESTION: Land defender documenting extractive activity or state violence on their phone. The same body, the same territory, a new tool.',
      artist: 'Archival source',
      medium: 'Documentary photograph',
      source: 'https://example.com/citation/trigger--645',
      description: 'The continuity of land defense into the digital, a body on the land using the tools of this time.'
    },
    {
      trigger: -665,
      src: '',
      side: 'right',
      verticalOffset: '40%',
      alt: 'Guacamaya communique',
      title: 'SUGGESTION: Screenshot of Guacamaya\'s RESISTENCIA communique. Their own words as image.',
      artist: 'Guacamaya',
      medium: 'Digital document',
      source: 'https://example.com/citation/trigger--665',
      description: 'Guacamaya\'s RESISTENCIA communique as artifact, their statement of purpose held alongside the quote the subtitle is displaying.'
    },

    // Scene 7 - Dark Hack Corridor (z=-700 onwards)
    // Scene 7 uses hack scene imagery on walls.
    // If adding floating images, they should feel like memory surfacing:
    // a face, a river, a dance, a march. Not documentation. Presence.
  ]
};
