const User = require("../../models/users");
const { Project } = require("../../models/projects");

const getOwnerDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user with populated projects
    const user = await User.findById(userId).populate({
      path: "ownedProjects",
      select: "title totalPrice expectedROI progress status category image investors createdAt",
    });

    if (!user || user.accountType !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Access denied. User is not a project owner.",
      });
    }

    const projects = user.ownedProjects || [];

    // Calculate statistics
    let totalProjects = projects.length;
    let totalFundingReceived = 0;
    let totalFundingGoal = 0;
    let activeProjects = 0;
    let completedProjects = 0;
    let totalInvestors = 0;
    const fundingHistory = [];

    projects.forEach((project) => {
      const fundedAmount = (project.totalPrice * project.progress) / 100;
      totalFundingReceived += fundedAmount;
      totalFundingGoal += project.totalPrice;

      // Count unique investors
      const projectInvestors = project.investors || [];
      totalInvestors += projectInvestors.length;

      if (project.status === "active" && project.progress < 100) {
        activeProjects++;
      } else if (project.progress === 100) {
        completedProjects++;
      }

      // Monthly funding history
      const month = new Date(project.createdAt).toLocaleString("en-US", {
        month: "short",
      });
      const existingMonth = fundingHistory.find((item) => item.month === month);
      if (existingMonth) {
        existingMonth.amount += fundedAmount;
      } else {
        fundingHistory.push({ month, amount: fundedAmount });
      }
    });

    // Calculate average funding percentage
    const averageFunding =
      projects.length > 0
        ? projects.reduce((sum, proj) => sum + proj.progress, 0) / projects.length
        : 0;

    // Get top performing projects (by progress)
    const topProjects = [...projects]
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5)
      .map((project) => ({
        _id: project._id,
        title: project.title,
        progress: project.progress,
        totalPrice: project.totalPrice,
        expectedROI: project.expectedROI,
        investorsCount: project.investors?.length || 0,
        image: project.image,
        category: project.category,
      }));

    // Prepare project details
    const projectDetails = projects.map((project) => {
      const fundedAmount = (project.totalPrice * project.progress) / 100;
      const investorsCount = project.investors?.length || 0;

      return {
        projectId: project._id,
        title: project.title,
        image: project.image,
        category: project.category,
        totalPrice: project.totalPrice,
        fundedAmount: Math.round(fundedAmount * 100) / 100,
        progress: project.progress,
        expectedROI: project.expectedROI,
        investorsCount,
        status: project.status,
        createdAt: project.createdAt,
      };
    });

    // Category distribution for pie chart
    const categoryDistribution = {};
    projects.forEach((project) => {
      if (!project.category) return;

      const categoryKey = project.category.en || project.category.ar || "Other";
      if (!categoryDistribution[categoryKey]) {
        categoryDistribution[categoryKey] = 0;
      }
      categoryDistribution[categoryKey] += (project.totalPrice * project.progress) / 100;
    });

    const pieData = Object.entries(categoryDistribution).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalProjects,
          totalFundingReceived: Math.round(totalFundingReceived * 100) / 100,
          totalFundingGoal: Math.round(totalFundingGoal * 100) / 100,
          averageFunding: Math.round(averageFunding * 100) / 100,
          activeProjects,
          completedProjects,
          totalInvestors,
        },
        fundingHistory: fundingHistory.sort((a, b) => {
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          return months.indexOf(a.month) - months.indexOf(b.month);
        }),
        projectDetails,
        topProjects,
        categoryDistribution: pieData,
      },
    });
  } catch (error) {
    console.error("Error fetching owner dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard data",
    });
  }
};

module.exports = { getOwnerDashboard };

