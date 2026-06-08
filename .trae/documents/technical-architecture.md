## 1. 架构设计

```mermaid
graph TB
    subgraph 前端层
        A["React 18 应用"] --> B["Three.js 3D引擎"]
        A --> C["Zustand 状态管理"]
        A --> D["TailwindCSS 样式"]
        B --> E["@react-three/fiber"]
        B --> F["@react-three/drei"]
        B --> G["@react-three/postprocessing"]
    end

    subgraph 数据层
        C --> H["Mock数据服务"]
        H --> I["垃圾桶状态数据"]
        H --> J["车辆轨迹数据"]
        H --> K["压缩箱传感器数据"]
        H --> L["历史预测数据"]
        H --> M["人员位置数据"]
    end

    subgraph 功能模块
        A --> N["满溢监控模块"]
        A --> O["路径规划模块"]
        A --> P["设备告警模块"]
        A --> Q["预测排班模块"]
        A --> R["权限审批模块"]
        A --> S["报表导出模块"]
    end
```

## 2. 技术说明

- 前端：React@18 + TailwindCSS@3 + Vite + TypeScript
- 初始化工具：vite-init
- 3D引擎：three + @react-three/fiber + @react-three/drei + @react-three/postprocessing
- 状态管理：zustand
- 路由：react-router-dom
- 后端：无（纯前端，使用Mock数据）
- 数据库：无（使用内存模拟数据+定时器模拟实时更新）
- 图表：recharts（预测曲线、趋势图）
- Excel导出：xlsx（SheetJS）
- 日期处理：dayjs

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| / | 登录页（人脸识别登录） |
| /dashboard | 3D城市全景主页面（核心页面） |
| /dispatch | 智能调度中心页面 |
| /report | 数据报表与导出页面 |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    "垃圾桶" {
        string 编号 PK
        string 位置
        string 类型
        number 满溢度
        number 收运倒计时
        string 状态
    }
    "垃圾车" {
        string 编号 PK
        number 当前载重
        number 最大载重
        string 当前路线
        string 状态
        number 位置X
        number 位置Z
    }
    "压缩箱" {
        string 编号 PK
        string 所属中转站
        number 液位
        number 温度
        boolean 喷淋状态
        string 故障状态
    }
    "人员" {
        string 编号 PK
        string 姓名
        string 工种
        number 位置X
        number 位置Z
        string 当前区域
    }
    "收运任务" {
        string 任务ID PK
        string 目标桶编号
        string 分配车辆编号
        string 路径
        string 状态
        string 创建时间
    }
    "维修工单" {
        string 工单ID PK
        string 设备编号
        string 设备类型
        string 故障描述
        string 状态
        string 创建时间
    }
    "审批记录" {
        string 审批ID PK
        string 排班方案ID
        string 审批级别
        string 审批人
        string 审批结果
        string 审批时间
    }
    "用户" {
        string 用户ID PK
        string 姓名
        string 角色
        string 人脸特征
        string 最后登录时间
    }
    "垃圾车" ||--o{ "收运任务" : "执行"
    "垃圾桶" ||--o{ "收运任务" : "触发"
    "压缩箱" ||--o{ "维修工单" : "生成"
```

## 5. 核心算法说明

### 5.1 最优路径规划
- 使用贪心算法：每次选择距离当前位置最近且满溢度最高的桶点
- 路径以绿色虚线动画显示，使用Three.js的Line2+LineMaterial实现虚线效果
- 多车交汇时基于优先级和到达时间自动调整顺序

### 5.2 满溢度预测
- 基于历史数据的加权移动平均预测
- 节假日乘以系数（1.3-2.0）调整预测值
- 每15分钟更新一次预测结果

### 5.3 三级审批状态机
- 待提交 → 调度员审批中 → 站长审批中 → 环卫局审批中 → 已通过
- 任意环节可拒绝，拒绝后退回待提交状态
