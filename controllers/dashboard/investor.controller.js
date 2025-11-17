const User = require("../../models/users");
const { Project } = require("../../models/projects");

const getInvestorDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user with populated investments
    const user = await User.findById(userId).populate({
      path: "investedProjects.project",
      select: "title totalPrice expectedROI progress status category image createdAt",
    });

    if (!user || user.accountType !== "investor") {
      return res.status(403).json({
        success: false,
        message: "Access denied. User is not an investor.",
      });
    }

    const investments = user.investedProjects || [];

    // Calculate statistics
    let totalInvested = 0;
    let totalExpectedReturns = 0;
    let activeInvestments = 0;
    let completedInvestments = 0;
    const investmentHistory = [];

    investments.forEach((investment) => {
      const project = investment.project;
      if (!project) return;

      const investedAmount = (project.totalPrice * investment.percentage) / 100;
      totalInvested += investedAmount;
      totalExpectedReturns += investedAmount * (project.expectedROI / 100);

      if (project.status === "active" && project.progress < 100) {
        activeInvestments++;
      } else if (project.progress === 100) {
        completedInvestments++;
      }

      // Monthly investment history
      const month = new Date(investment.investedAt).toLocaleString("en-US", {
        month: "short",
      });
      const existingMonth = investmentHistory.find((item) => item.month === month);
      if (existingMonth) {
        existingMonth.amount += investedAmount;
      } else {
        investmentHistory.push({ month, amount: investedAmount });
      }
    });

    // Calculate average ROI
    const averageROI =
      investments.length > 0
        ? investments.reduce((sum, inv) => {
            const project = inv.project;
            return project ? sum + project.expectedROI : sum;
          }, 0) / investments.length
        : 0;

    // Get recommended projects (projects with high ROI that user hasn't invested in)
    const investedProjectIds = investments.map((inv) => inv.project?._id?.toString()).filter(Boolean);
    const recommendedProjects = await Project.find({
      status: "active",
      _id: { $nin: investedProjectIds },
      progress: { $lt: 100 },
    })
      .select("title shortDesc totalPrice expectedROI progress category image")
      .sort({ expectedROI: -1 })
      .limit(5)
      .populate("owner", "firstName lastName");

    // Prepare investment details
    const investmentDetails = investments.map((investment) => {
      const project = investment.project;
      if (!project) return null;

      const investedAmount = (project.totalPrice * investment.percentage) / 100;
      const expectedReturn = investedAmount * (project.expectedROI / 100);

      return {
        projectId: project._id,
        projectTitle: project.title,
        projectImage: project.image,
        category: project.category,
        investedAmount,
        percentage: investment.percentage,
        expectedROI: project.expectedROI,
        expectedReturn,
        progress: project.progress,
        status: project.status,
        investedAt: investment.investedAt,
      };
    }).filter(Boolean);

    // Category distribution for pie chart
    const categoryDistribution = {};
    investments.forEach((investment) => {
      const project = investment.project;
      if (!project || !project.category) return;

      const categoryKey = project.category.en || project.category.ar || "Other";
      if (!categoryDistribution[categoryKey]) {
        categoryDistribution[categoryKey] = 0;
      }
      categoryDistribution[categoryKey] += (project.totalPrice * investment.percentage) / 100;
    });

    const pieData = Object.entries(categoryDistribution).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalInvested: Math.round(totalInvested * 100) / 100,
          totalExpectedReturns: Math.round(totalExpectedReturns * 100) / 100,
          averageROI: Math.round(averageROI * 100) / 100,
          activeInvestments,
          completedInvestments,
          totalInvestments: investments.length,
        },
        investmentHistory: investmentHistory.sort((a, b) => {
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          return months.indexOf(a.month) - months.indexOf(b.month);
        }),
        investmentDetails,
        recommendedProjects,
        categoryDistribution: pieData,
      },
    });
  } catch (error) {
    console.error("Error fetching investor dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard data",
    });
  }
};

module.exports = { getInvestorDashboard };

