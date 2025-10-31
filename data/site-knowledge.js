// Site Knowledge Base for AI Chatbot
// This file contains comprehensive information about SharkStage platform

const siteKnowledge = {
  platformName: "SharkStage",
  description: "SharkStage is an investment marketplace platform that connects visionary projects with strategic investors. A marketplace where innovative projects meet investors seeking opportunities.",
  
  mainFeatures: [
    {
      title: "Secure Transactions",
      description: "Bank-level security with encrypted payments and verified escrow services for complete peace of mind."
    },
    {
      title: "Growth Analytics",
      description: "Real-time data insights and performance metrics to track your investment portfolio growth."
    },
    {
      title: "Expert Community",
      description: "Connect with seasoned investors and entrepreneurs in our exclusive networking platform."
    },
    {
      title: "Fast Processing",
      description: "Lightning-fast deal execution with automated workflows and instant notifications."
    },
    {
      title: "Global Marketplace",
      description: "Access investment opportunities from around the world with multi-currency support."
    }
  ],

  investmentCategories: [
    {
      id: "real-estate",
      title: "Real Estate",
      description: "Commercial and residential property investments",
      roi: "12-25%"
    },
    {
      id: "technology",
      title: "Technology",
      description: "SaaS, apps, and digital product ventures",
      roi: "12-25%"
    },
    {
      id: "green-energy",
      title: "Green Energy",
      description: "Sustainable and renewable energy projects",
      roi: "12-25%"
    },
    {
      id: "ai-automation",
      title: "AI & Automation",
      description: "Machine learning and automation solutions",
      roi: "12-25%"
    },
    {
      id: "ecommerce",
      title: "E-commerce",
      description: "Online retail and marketplace platforms",
      roi: "12-25%"
    },
    {
      id: "startups",
      title: "Startups",
      description: "Early-stage ventures and MVPs",
      roi: "12-25%"
    }
  ],

  howToUse: {
    signUp: {
      description: "Create an account by clicking 'Sign Up' or 'Create one' link. You can sign up using email/password or through social login (Google, LinkedIn).",
      accountTypes: ["investor", "owner", "admin"],
      defaultType: "investor"
    },
    signIn: {
      description: "Sign in to your account using your email and password, or use social login options (Google, LinkedIn)."
    },
    listProject: {
      description: "As a project owner, you can list your project on the platform. Navigate to 'List your project' button to submit your investment opportunity."
    },
    invest: {
      description: "Browse projects on the '/projects' page. Filter by category, status, ROI, and funding goals. Click on a project to view details and invest."
    }
  },

  platformStats: {
    projectsFunded: "500+",
    activeInvestors: "1200+",
    totalInvestments: "$10M+"
  },

  projectInformation: {
    types: ["active", "closed"],
    details: {
      roi: "Projects show expected ROI percentages",
      fundingGoals: "Each project has a funding goal amount",
      status: "Projects can be active (accepting investments) or closed",
      timeline: "Projects include timelines and milestones",
      team: "Projects show management team information"
    }
  },

  languages: ["English", "Arabic"],
  
  contact: {
    platformWebsite: "SharkStage",
    support: "Use this chatbot for any questions about the platform"
  }
};

module.exports = siteKnowledge;

