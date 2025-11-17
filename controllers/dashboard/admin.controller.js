const User = require("../../models/users");
const { Project } = require("../../models/projects");
const Post = require("../../models/posts");
const FAQ = require("../../models/faq");

const getAdminDashboard = async (req, res) => {
  try {
    if (req.user.accountType !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    // Get all users
    const allUsers = await User.find({});
    
    // Get all projects
    const allProjects = await Project.find({}).populate("owner", "firstName lastName email");
    
    // Get all posts
    const allPosts = await Post.find({});
    
    // Get all FAQs
    const allFAQs = await FAQ.find({});

    // Calculate user statistics
    const totalUsers = allUsers.length;
    const investors = allUsers.filter(u => u.accountType === "investor").length;
    const owners = allUsers.filter(u => u.accountType === "owner").length;
    const admins = allUsers.filter(u => u.accountType === "admin").length;
    const bannedUsers = allUsers.filter(u => u.banned).length;

    // Calculate project statistics
    const totalProjects = allProjects.length;
    const activeProjects = allProjects.filter(p => p.status === "active").length;
    const closedProjects = allProjects.filter(p => p.status === "closed").length;
    
    // Calculate total funding
    let totalFundingReceived = 0;
    let totalFundingGoal = 0;
    allProjects.forEach(project => {
      totalFundingGoal += project.totalPrice;
      totalFundingReceived += (project.totalPrice * project.progress) / 100;
    });

    // Calculate total investments
    let totalInvestments = 0;
    let totalInvestors = 0;
    allProjects.forEach(project => {
      if (project.investors && project.investors.length > 0) {
        totalInvestors += project.investors.length;
        project.investors.forEach(investor => {
          totalInvestments += (project.totalPrice * investor.percentage) / 100;
        });
      }
    });

    // Calculate category distribution
    const categoryDistribution = {};
    allProjects.forEach(project => {
      const category = project.category?.en || "Other";
      categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
    });

    // Calculate account type distribution
    const accountTypeDistribution = {
      investor: investors,
      owner: owners,
      admin: admins,
    };

    // Calculate growth statistics (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentUsers = allUsers.filter(u => new Date(u.createdAt) >= sixMonthsAgo);
    const recentProjects = allProjects.filter(p => new Date(p.createdAt) >= sixMonthsAgo);

    // Monthly user growth
    const userGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const usersInMonth = allUsers.filter(u => {
        const userDate = new Date(u.createdAt);
        return userDate >= monthStart && userDate <= monthEnd;
      }).length;

      userGrowth.push({
        month: date.toLocaleString("en-US", { month: "short" }),
        users: usersInMonth,
      });
    }

    // Monthly project growth
    const projectGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const projectsInMonth = allProjects.filter(p => {
        const projectDate = new Date(p.createdAt);
        return projectDate >= monthStart && projectDate <= monthEnd;
      }).length;

      projectGrowth.push({
        month: date.toLocaleString("en-US", { month: "short" }),
        projects: projectsInMonth,
      });
    }

    // Recent activity (last 10 users, projects)
    const recentUsersList = allUsers
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(u => ({
        _id: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        accountType: u.accountType,
        createdAt: u.createdAt,
      }));

    const recentProjectsList = allProjects
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(p => ({
        _id: p._id,
        title: p.title,
        status: p.status,
        progress: p.progress,
        totalPrice: p.totalPrice,
        owner: p.owner ? {
          _id: p.owner._id,
          firstName: p.owner.firstName,
          lastName: p.owner.lastName,
          email: p.owner.email,
        } : null,
        createdAt: p.createdAt,
      }));

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          investors,
          owners,
          admins,
          bannedUsers,
          totalProjects,
          activeProjects,
          closedProjects,
          totalFundingReceived,
          totalFundingGoal,
          totalInvestments,
          totalInvestors,
          totalPosts: allPosts.length,
          totalFAQs: allFAQs.length,
        },
        categoryDistribution,
        accountTypeDistribution,
        userGrowth,
        projectGrowth,
        recentUsers: recentUsersList,
        recentProjects: recentProjectsList,
      },
    });
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { getAdminDashboard };

