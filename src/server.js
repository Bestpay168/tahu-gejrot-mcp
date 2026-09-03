import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

import fs from "fs";
import path from "path";

/* =========================================================
   CONFIGURATION
========================================================= */

const ROOT = process.cwd();

const CHARACTER_FILE = path.join(
  ROOT,
  "character.json"
);

const OUTPUT_DIR = path.join(
  ROOT,
  "output"
);

const OUTPUT_VIDEOS = path.join(
  OUTPUT_DIR,
  "videos"
);

const OUTPUT_CAPTIONS = path.join(
  OUTPUT_DIR,
  "captions"
);

const OUTPUT_SCENES = path.join(
  OUTPUT_DIR,
  "scenes"
);

/* =========================================================
   CREATE DIRECTORIES
========================================================= */

[
  OUTPUT_DIR,
  OUTPUT_VIDEOS,
  OUTPUT_CAPTIONS,
  OUTPUT_SCENES
].forEach((directory) => {

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, {
      recursive: true
    });
  }

});

/* =========================================================
   LOAD CHARACTER
========================================================= */

let character = {};

try {

  character = JSON.parse(
    fs.readFileSync(
      CHARACTER_FILE,
      "utf8"
    )
  );

} catch (error) {

  console.error(
    "WARNING: character.json tidak ditemukan."
  );

}

/* =========================================================
   MCP SERVER
========================================================= */

const server = new Server(
  {
    name: "tahu-gejrot-video-mcp",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function getCharacterDescription() {

  return `
Use the exact Tahu Gejrot Pakde Burung female mascot
from the reference image.

Character identity must remain consistent.

FACE:
- fair glowing skin
- soft rounded face
- large expressive brown eyes
- long stylized eyelashes
- small delicate nose
- soft rosy cheeks
- warm friendly smile

HAIR:
- golden blonde
- short smooth bob haircut
- side parted
- glossy
- chin to neck length

BODY:
- slim body
- slightly oversized head
- long slim legs
- premium stylized 3D mascot proportions

OUTFIT:
- bright hot pink crew-neck T-shirt
- center chest logo:
  "TAHU GEJROT PAKDE BURUNG"
- medium blue slim-fit jeans
- clean white sneakers

DO NOT CHANGE:
- face
- eyes
- skin tone
- hair color
- hairstyle
- body proportions
- shirt
- shirt color
- logo
- jeans
- sneakers
`;

}


function getNegativePrompt() {

  return `
different character,
different face,
face morphing,
identity drift,
long hair,
ponytail,
bangs covering eyes,
black hair,
brown hair,
glasses,
sunglasses,
jewelry,
necklace,
earrings,
hat,
jacket,
hoodie,
dress,
skirt,
shorts,
wrong shirt color,
missing logo,
wrong logo,
distorted logo,
different pants,
different shoes,
photorealistic human,
realistic human face,
deformed hands,
extra fingers,
extra arms,
extra legs,
extra limbs,
bad anatomy,
body distortion,
face distortion,
flickering,
character inconsistency,
low quality,
blurry character
`;

}


function createVideoPrompt(
  scene,
  duration = 5
) {

  return `
PREMIUM 3D VIDEO PROMPT

Create a premium stylized 3D animated
commercial video for TAHU GEJROT PAKDE BURUNG.

REFERENCE IMAGE:
Use mascot.png as the highest-priority
visual identity reference.

CHARACTER:
${getCharacterDescription()}

SCENE:
${scene}

ANIMATION:
Natural smooth human-like mascot movement.
Cheerful, energetic, playful and confident.
Natural blinking and subtle facial animation.
Keep facial identity completely consistent.

CAMERA:
Cinematic commercial camera.
Smooth movement.
Stable framing.
Natural perspective.

LIGHTING:
Cinematic soft lighting.
Premium commercial quality.
Warm Indonesian street-food atmosphere.

VIDEO:
Vertical 9:16.
Duration: ${duration} seconds.
1080x1920.
30 FPS.

BRAND:
TAHU GEJROT PAKDE BURUNG.

CHARACTER CONSISTENCY:
The mascot must remain exactly the same
from the first frame to the last frame.

NEGATIVE PROMPT:
${getNegativePrompt()}
`;

}


function createScene(scene) {

  return {
    scene_id: `scene_${Date.now()}`,

    duration_seconds: 5,

    aspect_ratio: "9:16",

    location:
      "Indonesian street food environment",

    character: {
      id: "mascot_001",
      action: scene,
      expression:
        "cheerful friendly smile",
      movement:
        "natural smooth mascot movement"
    },

    timeline: [
      {
        time: "0-2s",
        action:
          "Mascot introduces the scene naturally."
      },

      {
        time: "2-4s",
        action:
          scene
      },

      {
        time: "4-5s",
        action:
          "Mascot looks toward camera and gives a warm confident smile."
      }
    ],

    camera: {
      type: "cinematic",
      movement: "smooth",
      framing: "medium shot",
      angle: "eye level"
    },

    lighting:
      "cinematic soft commercial lighting",

    consistency:
      "Maximum character consistency"
  };

}


function createCaption(scene) {

  return `
🔥 Pedasnya nampol, kuahnya bikin nagih! 🤤

TAHU GEJROT PAKDE BURUNG
Jajanan khas Indonesia yang bikin susah berhenti ngemil!

${scene}

Cobain sekarang! ❤️

#TahuGejrot
#TahuGejrotPakdeBurung
#KulinerJakarta
#JajananJakarta
#KulinerIndonesia
#JajananIndonesia
#StreetFoodIndonesia
#FYP
#TikTokKuliner
`;

}


/* =========================================================
   TOOL LIST
========================================================= */

server.setRequestHandler(
  ListToolsRequestSchema,

  async () => {

    return {

      tools: [

        {
          name: "get_character",

          description:
            "Mengambil identitas mascot Tahu Gejrot Pakde Burung.",

          inputSchema: {
            type: "object",
            properties: {}
          }
        },

        {
          name: "create_video_prompt",

          description:
            "Membuat prompt video dengan karakter mascot yang konsisten.",

          inputSchema: {

            type: "object",

            properties: {

              scene: {
                type: "string",
                description:
                  "Deskripsi adegan video."
              },

              duration: {
                type: "number",
                description:
                  "Durasi video dalam detik."
              }

            },

            required: [
              "scene"
            ]

          }

        },

        {
          name: "create_scene",

          description:
            "Membuat struktur scene video.",

          inputSchema: {

            type: "object",

            properties: {

              scene: {
                type: "string",
                description:
                  "Deskripsi aksi utama mascot."
              }

            },

            required: [
              "scene"
            ]

          }

        },

        {
          name: "create_caption",

          description:
            "Membuat caption TikTok, Reels dan Shorts.",

          inputSchema: {

            type: "object",

            properties: {

              scene: {
                type: "string",
                description:
                  "Isi atau tema video."
              }

            },

            required: [
              "scene"
            ]

          }

        },

        {
          name: "create_video_package",

          description:
            "Membuat Prompt + Scene + Caption sekaligus.",

          inputSchema: {

            type: "object",

            properties: {

              scene: {
                type: "string",
                description:
                  "Ide atau aksi utama video."
              },

              duration: {
                type: "number",
                description:
                  "Durasi video dalam detik."
              }

            },

            required: [
              "scene"
            ]

          }

        }

      ]

    };

  }
);


/* =========================================================
   TOOL EXECUTION
========================================================= */

server.setRequestHandler(
  CallToolRequestSchema,

  async (request) => {

    const tool =
      request.params.name;

    const args =
      request.params.arguments || {};

    /* -----------------------------------------------------
       GET CHARACTER
    ----------------------------------------------------- */

    if (tool === "get_character") {

      return {

        content: [

          {
            type: "text",

            text: JSON.stringify(
              character,
              null,
              2
            )
          }

        ]

      };

    }


    /* -----------------------------------------------------
       CREATE VIDEO PROMPT
    ----------------------------------------------------- */

    if (
      tool ===
      "create_video_prompt"
    ) {

      const scene =
        args.scene || "";

      const duration =
        args.duration || 5;

      const prompt =
        createVideoPrompt(
          scene,
          duration
        );

      return {

        content: [

          {
            type: "text",
            text: prompt.trim()
          }

        ]

      };

    }


    /* -----------------------------------------------------
       CREATE SCENE
    ----------------------------------------------------- */

    if (
      tool ===
      "create_scene"
    ) {

      const scene =
        args.scene || "";

      const result =
        createScene(scene);

      return {

        content: [

          {
            type: "text",

            text: JSON.stringify(
              result,
              null,
              2
            )
          }

        ]

      };

    }


    /* -----------------------------------------------------
       CREATE CAPTION
    ----------------------------------------------------- */

    if (
      tool ===
      "create_caption"
    ) {

      const scene =
        args.scene || "";

      const caption =
        createCaption(scene);

      return {

        content: [

          {
            type: "text",
            text: caption.trim()
          }

        ]

      };

    }


    /* -----------------------------------------------------
       CREATE VIDEO PACKAGE
    ----------------------------------------------------- */

    if (
      tool ===
      "create_video_package"
    ) {

      const scene =
        args.scene || "";

      const duration =
        args.duration || 5;

      const videoPrompt =
        createVideoPrompt(
          scene,
          duration
        );

      const sceneData =
        createScene(scene);

      const caption =
        createCaption(scene);

      const packageData = {

        project:
          "TAHU GEJROT PAKDE BURUNG",

        character_id:
          "mascot_001",

        video: {

          prompt:
            videoPrompt,

          scene:
            sceneData,

          caption:
            caption,

          settings: {

            aspect_ratio:
              "9:16",

            resolution:
              "1080x1920",

            duration_seconds:
              duration,

            fps: 30,

            format:
              "mp4"

          }

        }

      };


      /* -------------------------------------------------
         SAVE SCENE
      ------------------------------------------------- */

      const timestamp =
        Date.now();

      const sceneFile =
        path.join(
          OUTPUT_SCENES,
          `scene_${timestamp}.json`
        );

      fs.writeFileSync(
        sceneFile,
        JSON.stringify(
          sceneData,
          null,
          2
        )
      );


      /* -------------------------------------------------
         SAVE CAPTION
      ------------------------------------------------- */

      const captionFile =
        path.join(
          OUTPUT_CAPTIONS,
          `caption_${timestamp}.txt`
        );

      fs.writeFileSync(
        captionFile,
        caption
      );


      /* -------------------------------------------------
         RETURN RESULT
      ------------------------------------------------- */

      return {

        content: [

          {

            type: "text",

            text:
              JSON.stringify(
                packageData,
                null,
                2
              )

          }

        ]

      };

    }


    /* -----------------------------------------------------
       UNKNOWN TOOL
    ----------------------------------------------------- */

    throw new Error(
      `Tool tidak dikenal: ${tool}`
    );

  }
);


/* =========================================================
   START SERVER
========================================================= */

const transport =
  new StdioServerTransport();

await server.connect(
  transport
);