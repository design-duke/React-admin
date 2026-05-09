import { DollarOutlined, ContainerOutlined } from "@ant-design/icons";
import { Card, Statistic, Space, Row, Col, StatisticProps } from "antd";
import React, { useEffect, useState } from "react";
import CountUp from "react-countup";
import FooterCard from "./footerCard/index";
import Chart from "@/components/Chart/index";
import type { EChartsOption } from "echarts";

import styles from "./index.module.less";
const Home: React.FC = () => {
  const [cardTitle, setCardTitle] = useState([
    {
      title: "今日订单总数",
      value: 110,
      prefix: <ContainerOutlined style={{ color: "rgb(18,150,219)" }} />,
    },
    {
      title: "今日销售总额",
      value: 213.06,
      prefix: <DollarOutlined style={{ color: "rgb(18,150,219)" }} />,
    },
    {
      title: "昨日销售总额",
      value: 3333.66,
      prefix: <DollarOutlined style={{ color: "rgb(18,150,219)" }} />,
    },
  ]);

  const formatter: StatisticProps["formatter"] = (value: number) => (
    <CountUp end={value} separator="," />
  );

  const salesOption: EChartsOption = {
    title: {
      text: "近7日销售额趋势",
      left: "center",
    },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    },
    yAxis: {
      type: "value",
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed",
          color: "#e0e0e0",
          width: 1,
        },
      },
    },
    series: [
      {
        name: "销售额",
        type: "line",
        data: [120, 200, 150, 300, 450, 600, 500],
        smooth: true,
      },
    ],
  };

  useEffect(() => {}, []);

  return (
    <div className="bg-zinc-100 p-6">
      <Space orientation="vertical" size="middle" style={{ display: "flex" }}>
        <div className="p-5">
          <Row gutter={16}>
            {cardTitle.map((item) => (
              <Col span={8} key={item.title}>
                <Card title={item.title}>
                  {/* <Statistic
                    precision={2}
                    value={item.value}
                    prefix={item.prefix}
                    formatter={formatter}
                  /> */}
                </Card>
              </Col>
            ))}
          </Row>
        </div>
        <FooterCard />
        <div className={`${styles.chartContainer}`}>
          <Chart option={salesOption} />
        </div>
      </Space>
    </div>
  );
};

export default Home;
