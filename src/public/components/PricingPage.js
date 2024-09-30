const PricingPage = () => {
  const [isYearly, setIsYearly] = React.useState(false);
  const [openFaq, setOpenFaq] = React.useState(null);
  const [selectedPlan, setSelectedPlan] = React.useState(null);
  const [paymentMethod, setPaymentMethod] = React.useState(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const plans = [
    {
      name: "基础计划",
      monthlyPrice: "¥39",
      yearlyPrice: "¥390",
      features: [
        "每月4000次标准查询",
        "每月200次高级查询",
        "无限文档、页面、视觉和YouTube阅读器",
        "无限网络访问、TTS/STT、OCR",
        "无限AI搜索",
        "所有高级功能访问"
      ],
      isPopular: false,
      color: "blue"
    },
    {
      name: "专业计划",
      monthlyPrice: "¥79",
      yearlyPrice: "¥790",
      features: [
        "每月8000次标准查询",
        "每月400次高级查询",
        "无限文档、页面、视觉和YouTube阅读器",
        "无限网络访问、TTS/STT、OCR",
        "无限AI搜索",
        "所有高级功能访问",
        "更快的响应速度"
      ],
      isPopular: true,
      color: "indigo"
    },
    {
      name: "高级计划",
      monthlyPrice: "¥159",
      yearlyPrice: "¥1590",
      features: [
        "每月16000次标准查询",
        "每月800次高级查询",
        "无限文档、页面、视觉和YouTube阅读器",
        "无限网络访问、TTS/STT、OCR",
        "无限AI搜索",
        "所有高级功能访问",
        "最快的响应速度",
        "优先电子邮件支持"
      ],
      isPopular: false,
      color: "purple"
    }
  ];

  const faqs = [
    {
      question: "如何选择适合我的计划？",
      answer: "根据您的使用频率和需求选择。如果您是偶尔使用，基础计划可能足够；如果您是频繁用户，专业或高级计划可能更适合。"
    },
    {
      question: "我可以随时更改我的计划吗？",
      answer: "是的，您可以随时升级或降级您的计划。更改将在下一个计费周期生效。"
    },
    {
      question: "有免费试用吗？",
      answer: "我们提供14天的免费试用，让您可以体验所有功能。试用期结束后，您可以选择继续订阅或取消。"
    },
    {
      question: "如果我不满意可以退款吗？",
      answer: "我们提供30天的退款保证。如果您在购买后30天内对服务不满意，可以申请全额退款。"
    }
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handlePlanSelection = (planName) => {
    setSelectedPlan(planName);
  };

  // 模拟支付 API 调用
  const simulatePaymentAPI = (planName, method, isYearly) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 模拟 80% 的成功率
        if (Math.random() < 0.8) {
          resolve({ success: true, message: "支付成功" });
        } else {
          reject({ success: false, message: "支付失败，请稍后重试" });
        }
      }, 2000); // 模拟 2 秒的网络延迟
    });
  };

  const handlePayment = async () => {
    if (!selectedPlan) {
      alert('请先选择一个计划');
      return;
    }
    if (!paymentMethod) {
      alert('请选择支付方式');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await simulatePaymentAPI(selectedPlan, paymentMethod, isYearly);
      alert(result.message);
      // 这里可以添加成功后的逻辑，比如更新用户状态或重定向到成功页面
    } catch (error) {
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            选择适合您的计划
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            无论您是个人用户还是企业用户，我们都有适合您的方案
          </p>
          <div className="mt-8 flex justify-center">
            <div className="relative bg-white rounded-lg p-0.5 flex">
              <button
                onClick={() => setIsYearly(false)}
                className={`${
                  !isYearly ? 'bg-indigo-500 text-white' : 'text-gray-500'
                } relative w-1/2 rounded-md py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10 sm:w-auto sm:px-8`}
              >
                月付
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`${
                  isYearly ? 'bg-indigo-500 text-white' : 'text-gray-500'
                } ml-0.5 relative w-1/2 rounded-md py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10 sm:w-auto sm:px-8`}
              >
                年付（省17%）
              </button>
            </div>
          </div>
        </div>
        <div className="mt-16 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`relative ${
                plan.isPopular ? 'bg-white shadow-2xl ring-2 ring-indigo-500' : 'bg-white shadow-xl'
              } rounded-2xl cursor-pointer transition-all duration-300 ${
                selectedPlan === plan.name ? 'transform scale-105 ring-4 ring-blue-500' : ''
              }`}
              onClick={() => handlePlanSelection(plan.name)}
            >
              {plan.isPopular && (
                <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-indigo-500 text-white">
                  最受欢迎
                </span>
              )}
              <div className="p-8">
                <h3 className={`text-2xl font-semibold text-${plan.color}-600 text-center`}>{plan.name}</h3>
                <p className="mt-4 text-center">
                  <span className="text-4xl font-extrabold text-gray-900">{isYearly ? plan.yearlyPrice : plan.monthlyPrice}</span>
                  <span className="text-base font-medium text-gray-500">/{isYearly ? '年' : '月'}</span>
                </p>
                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-${plan.color}-500 flex items-center justify-center`}>
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-700">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8 border-t border-gray-200 pt-8 px-8 pb-8">
                <button 
                  className={`w-full bg-${plan.color}-500 hover:bg-${plan.color}-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200`}
                >
                  {selectedPlan === plan.name ? '已选择' : `选择${plan.name}`}
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedPlan && (
          <div className="mt-12 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">选择支付方式</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => setPaymentMethod('支付宝')}
                className={`flex-1 py-2 px-4 border rounded-md ${
                  paymentMethod === '支付宝' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
                }`}
                disabled={isProcessing}
              >
                支付宝
              </button>
              <button
                onClick={() => setPaymentMethod('微信')}
                className={`flex-1 py-2 px-4 border rounded-md ${
                  paymentMethod === '微信' ? 'bg-green-500 text-white' : 'bg-white text-gray-700'
                }`}
                disabled={isProcessing}
              >
                微信支付
              </button>
            </div>
            <button
              onClick={handlePayment}
              className={`mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200 ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isProcessing}
            >
              {isProcessing ? '处理中...' : '确认支付'}
            </button>
          </div>
        )}

        <div className="mt-24">
          <h3 className="text-2xl font-extrabold text-gray-900 text-center mb-8">计划比较</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">功能</th>
                  {plans.map(plan => (
                    <th key={plan.name} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{plan.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {plans[0].features.map((feature, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{feature}</td>
                    {plans.map(plan => (
                      <td key={plan.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {plan.features.includes(feature) ? '✓' : '✗'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-24">
          <h3 className="text-2xl font-extrabold text-gray-900 text-center mb-8">常见问题</h3>
          <dl className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white shadow overflow-hidden rounded-lg">
                <dt className="text-lg">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="flex justify-between w-full px-4 py-5 focus:outline-none"
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    <span className="ml-6 flex-shrink-0">
                      <svg className={`h-5 w-5 transform ${openFaq === index ? '-rotate-180' : 'rotate-0'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </button>
                </dt>
                <dd className={`px-4 pb-5 ${openFaq === index ? 'block' : 'hidden'}`}>
                  <p className="text-base text-gray-500">{faq.answer}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-24 bg-indigo-700 rounded-lg shadow-xl overflow-hidden">
          <div className="px-6 py-12 sm:px-12 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
            <div className="lg:self-center">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                <span className="block">还有疑问？</span>
                <span className="block">联系我们获取更多信息</span>
              </h2>
              <p className="mt-4 text-lg leading-6 text-indigo-200">
                我们的客户支持团队随时为您解答任何问题，帮助您选择最适合的计划。
              </p>
              <a
                href="#"
                className="mt-8 bg-white border border-transparent rounded-md shadow px-5 py-3 inline-flex items-center text-base font-medium text-indigo-600 hover:bg-indigo-50"
              >
                联系我们
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.PricingPage = PricingPage;