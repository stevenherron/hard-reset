export const MOVES = {
    // Punches
    "1": { name: "Jab", type: "strike", beats: 1, audio: "jab" },
    "2": { name: "Cross", type: "strike", beats: 1, audio: "cross" },
    "3": { name: "Lead Hook", type: "strike", beats: 1, audio: "hook" },
    "4": { name: "Rear Hook", type: "strike", beats: 1, audio: "rear hook" },
    "5": { name: "Lead Uppercut", type: "strike", beats: 1, audio: "uppercut" },
    "6": { name: "Rear Uppercut", type: "strike", beats: 1, audio: "rear uppercut" },
    "1b": { name: "Body Jab", type: "strike", beats: 1, audio: "body jab" },
    "3b": { name: "Body Hook", type: "strike", beats: 1.2, audio: "body hook" },

    // Defense
    "Slip Left": { name: "Slip Left", type: "defense", beats: 1, audio: "slip" },
    "Slip Right": { name: "Slip Right", type: "defense", beats: 1, audio: "slip" },
    "Slip": { name: "Slip", type: "defense", beats: 1, audio: "slip" }, // Generic
    "Roll": { name: "Roll", type: "defense", beats: 1.5, audio: "roll" },
    "Pull": { name: "Pull", type: "defense", beats: 1, audio: "pull" },
    "Check": { name: "Check", type: "defense", beats: 1, audio: "check" },
    "Block": { name: "Block", type: "defense", beats: 1, audio: "block" },
    "Long Guard": { name: "Long Guard", type: "defense", beats: 1, audio: "long guard" },

    // Kicks
    "Low Kick": { name: "Low Kick", type: "kick", beats: 2, audio: "low kick" },
    "Low Kick (Rear)": { name: "Low Kick", type: "kick", beats: 2, audio: "low kick" },
    "Middle Kick": { name: "Middle Kick", type: "kick", beats: 2, audio: "middle kick" },
    "High Kick": { name: "High Kick", type: "kick", beats: 2, audio: "high kick" },
    "Teep": { name: "Teep", type: "kick", beats: 1.5, audio: "teep" },
    "Front Kick": { name: "Teep", type: "kick", beats: 1.5, audio: "teep" },
    "Switch Kick": { name: "Switch Kick", type: "kick", beats: 2.5, audio: "switch kick" },
    "Return Kick": { name: "Return Kick", type: "kick", beats: 2, audio: "kick" },
    "B-Kick": { name: "Body Kick", type: "kick", beats: 2, audio: "body kick" },

    // Knees & Elbows
    "Knee": { name: "Knee", type: "knee", beats: 1.5, audio: "knee" },
    "Knee (Rear)": { name: "Knee", type: "knee", beats: 1.5, audio: "knee" },
    "Switch Knee": { name: "Switch Knee", type: "knee", beats: 2, audio: "switch knee" },
    "Knee (Flying)": { name: "Flying Knee", type: "knee", beats: 2.5, audio: "flying knee" },
    "Elbow": { name: "Elbow", type: "elbow", beats: 1, audio: "elbow" },
    "Elbow (Horizontal Lead)": { name: "Lead Elbow", type: "elbow", beats: 1, audio: "elbow" },
    "Elbow (Upward)": { name: "Upward Elbow", type: "elbow", beats: 1, audio: "elbow" },
    "Elbow (Spinning)": { name: "Spinning Elbow", type: "elbow", beats: 2.5, audio: "spinning elbow" },
    "Elbow (Spear)": { name: "Spear Elbow", type: "elbow", beats: 1, audio: "elbow" },

    // Special
    "Feint 1": { name: "Feint Jab", type: "misc", beats: 0.5, audio: "feint" },
    "Feint Low Kick": { name: "Feint Low Kick", type: "misc", beats: 1, audio: "feint" },
    "Superman Punch": { name: "Superman Punch", type: "strike", beats: 2, audio: "superman" },
    "Liver Shot (3b)": { name: "Liver Shot", type: "strike", beats: 1.2, audio: "liver shot" },
    "Clinch": { name: "Clinch", type: "misc", beats: 1, audio: "clinch" },
    "Push": { name: "Push", type: "misc", beats: 1, audio: "push" },
    "Catch Kick (Sim)": { name: "Catch Kick", type: "defense", beats: 1, audio: "catch" },
    "Hop (Fake)": { name: "Hop", type: "misc", beats: 0.5, audio: "hop" },
    "Land vorn": { name: "Land Forward", type: "misc", beats: 0.5, audio: "land" },
};
