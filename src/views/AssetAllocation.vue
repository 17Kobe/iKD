<template>
    <div>
        <el-row style="display: flex; flex-wrap: wrap">
            <el-col :xs="12" :sm="10" :md="7" :lg="7" :xl="5" style="display: flex; padding: 4px 2px 0 4px">
                <el-card shadow="hover" ref="leftCard" style="flex: 1">
                    <BarChart :chartData="barData" :options="barOptions" />
                </el-card>
            </el-col>
            <el-col :xs="12" :sm="10" :md="7" :lg="7" :xl="5" style="display: flex; padding: 4px 4px 0 2px">
                <el-card shadow="hover" style="flex: 1" id="line-chart-card">
                    <div style="font-size: 12px; text-align: center; font-weight: bold; margin-top: 2px; color: #6c6c6c">
                        財務走勢 (今日增減: $
                        <span :style="[todayAsset >= 0 ? { color: '#409eff' } : { color: '#f56c6c' }]">{{
                            (todayAsset >= 0 ? '+' : '') + todayAsset.toLocaleString('en-US')
                        }}</span
                        >)
                    </div>
                    <el-tooltip class="box-item" effect="dark" placement="bottom">
                        <template #content>
                            <div>
                                <div style="font-size: 14px">
                                    <span style="color: #00bfae; font-size: 16px; margin-right: 2px">📈</span>存股金額：
                                    <span
                                        style="
                                            color: rgb(255, 99, 132);
                                            padding: 2px 4px;
                                            border-radius: 3px;
                                            font-size: 15px;
                                            font-weight: bold;
                                        "
                                        >$ {{ stockSavingsAmount.toLocaleString('en-US') }} 元</span
                                    >
                                </div>
                                <div style="font-size: 14px">
                                    <span style="color: #e91e63; font-size: 16px; margin-right: 2px">💹</span>排除存股的資產：
                                    <span
                                        style="
                                            color: rgb(176, 224, 230);
                                            padding: 2px 4px;
                                            border-radius: 3px;
                                            font-size: 15px;
                                            font-weight: bold;
                                        "
                                        >$ {{ assetsExcludingStockSavings.toLocaleString('en-US') }} 元</span
                                    >
                                </div>
                                <hr style="margin: 8px 0; border: none; border-top: 1px solid #e0e0e0" />
                                <div style="font-size: 14px">
                                    <span style="color: #ffd700; font-size: 16px; margin-right: 2px">💰</span>可投資金額：
                                    <span
                                        style="
                                            color: rgb(255, 202, 100);
                                            padding: 2px 4px;
                                            border-radius: 3px;
                                            font-size: 15px;
                                            font-weight: bold;
                                        "
                                        >$ {{ availableInvestmentAmount.toLocaleString('en-US') }} 元</span
                                    >
                                </div>
                                <!-- 新增每單位投資金額 -->
                                <div style="font-size: 14px">
                                    <span style="color: #00bfae; font-size: 16px; margin-right: 2px">📈</span>每單位投資金額(/9)：
                                    <span
                                        style="
                                            color: rgb(66, 202, 162);
                                            padding: 2px 4px;
                                            border-radius: 3px;
                                            font-size: 15px;
                                            font-weight: bold;
                                        "
                                        >$ {{ Math.round(availableInvestmentAmount / 9).toLocaleString('en-US') }} 元</span
                                    >
                                </div>
                                <hr style="margin: 8px 0; border: none; border-top: 1px solid #e0e0e0" />
                                <div style="font-size: 14px">
                                    <span style="color: #ffd700; font-size: 16px; margin-right: 2px">💰</span>現金：
                                    <span
                                        style="
                                            color: rgb(255, 205, 86);
                                            padding: 2px 4px;
                                            border-radius: 3px;
                                            font-size: 15px;
                                            font-weight: bold;
                                        "
                                        >$ {{ demandDeposit.toLocaleString('en-US') }} 元</span
                                    >
                                </div>
                                <div style="font-size: 14px">
                                    <span style="color: #ff9800; font-size: 16px; margin-right: 2px">🏦</span>定存：
                                    <span
                                        style="
                                            color: rgb(255, 159, 64);
                                            padding: 2px 4px;
                                            border-radius: 3px;
                                            font-size: 15px;
                                            font-weight: bold;
                                        "
                                        >$ {{ fixedDeposit.toLocaleString('en-US') }} 元</span
                                    >
                                </div>
                                <div style="font-size: 14px">
                                    <span style="color: #e91e63; font-size: 16px; margin-right: 2px">💹</span>存股：
                                    <span
                                        style="
                                            color: rgb(255, 99, 132);
                                            padding: 2px 4px;
                                            border-radius: 3px;
                                            font-size: 15px;
                                            font-weight: bold;
                                        "
                                        >$ {{ chtStockDeposit.toLocaleString('en-US') }} 元</span
                                    >
                                </div>
                                <div style="font-size: 14px">
                                    <span style="color: #00bfae; font-size: 16px; margin-right: 2px">📈</span>股票：
                                    <span
                                        style="
                                            color: rgb(66, 202, 162);
                                            padding: 2px 4px;
                                            border-radius: 3px;
                                            font-size: 15px;
                                            font-weight: bold;
                                        "
                                        >$ {{ stockDeposit.toLocaleString('en-US') }} 元</span
                                    >
                                </div>
                                <div style="font-size: 14px">
                                    <span style="color: #9966ff; font-size: 16px; margin-right: 2px">💳</span>債券：
                                    <span
                                        style="
                                            color: rgb(153, 102, 255);
                                            padding: 2px 4px;
                                            border-radius: 3px;
                                            font-size: 15px;
                                            font-weight: bold;
                                        "
                                        >$ {{ bondDeposit.toLocaleString('en-US') }} 元</span
                                    >
                                </div>
                                <div style="font-size: 14px">
                                    <span style="color: #bdbdbd; font-size: 16px; margin-right: 2px">📦</span>其它：
                                    <span
                                        style="
                                            color: rgb(200, 200, 200);
                                            padding: 2px 4px;
                                            border-radius: 3px;
                                            font-size: 15px;
                                            font-weight: bold;
                                        "
                                        >$ {{ otherDeposit.toLocaleString('en-US') }} 元</span
                                    >
                                </div>

                                <!-- 年度預算資訊 -->
                                <hr style="margin: 8px 0; border: none; border-top: 1px solid #e0e0e0" />
                                <div style="font-size: 14px; color: #409eff; margin-bottom: 4px; font-weight: bold">
                                    📊 剩餘 {{ remainingBudget.remainingMonths }} 個月預算 ({{ new Date().getFullYear() }} 年)
                                </div>

                                <div style="font-size: 13px">
                                    月薪：
                                    <span style="color: #afdbfb; font-weight: bold">
                                        $ {{ monthlySalary.toLocaleString('en-US') }} 元
                                    </span>
                                </div>
                                <div style="font-size: 13px">
                                    年薪：
                                    <span style="color: #afdbfb; font-weight: bold">
                                        $ {{ annualSalary.toLocaleString('en-US') }} 元
                                    </span>
                                </div>

                                <div style="font-size: 13px">
                                    固定收入：
                                    <span style="color: #afdbfb; font-weight: bold; text-decoration: underline">
                                        $ +{{ remainingBudget.remainingFixedIncome.toLocaleString('en-US') }} 元
                                    </span>
                                </div>
                                <div style="font-size: 13px">
                                    固定支出：
                                    <span style="color: #f3a5b4; font-weight: bold; text-decoration: underline">
                                        $ -{{ remainingBudget.remainingFixedExpenses.toLocaleString('en-US') }} 元
                                    </span>
                                </div>
                                <div style="font-size: 13px">
                                    一次性收入：
                                    <span style="color: #afdbfb; font-weight: bold">
                                        $ +{{ remainingBudget.remainingOneTimeIncome.toLocaleString('en-US') }} 元
                                    </span>
                                </div>
                                <div style="font-size: 13px">
                                    一次性支出：
                                    <span style="color: #f3a5b4; font-weight: bold">
                                        $ -{{ remainingBudget.remainingOneTimeExpenseAmount.toLocaleString('en-US') }} 元
                                    </span>
                                </div>

                                <!-- 一次性收入/支出清單 -->
                                <hr style="margin: 6px 0; border: none; border-top: 1px solid #e0e0e0" />
                                <div style="font-size: 14px; color: #409eff; margin-bottom: 4px; font-weight: bold">
                                    📋 剩餘一次性收入/支出清單
                                </div>
                                <div
                                    v-for="item in remainingBudget.oneTimeItemsList"
                                    :key="item.name + item.month"
                                    style="font-size: 12px; margin-left: 8px; line-height: 1.4"
                                >
                                    • {{ item.dateStr }} {{ item.name }}:
                                    <span v-if="item.type === 'income'" style="color: #afdbfb; font-weight: bold">
                                        $ {{ item.amountStr }} 元
                                    </span>
                                    <span v-else style="color: #f3a5b4; font-weight: bold"> $ {{ item.amountStr }} 元 </span>
                                </div>

                                <!-- 預算不足警示 -->
                                <hr style="margin: 6px 0; border: none; border-top: 1px solid #e0e0e0" />
                                <div
                                    v-if="remainingBudget.budgetShortfall > 0"
                                    style="
                                        font-size: 14px;
                                        color: #f56c6c;
                                        font-weight: bold;
                                        background: #fef0f0;
                                        padding: 6px 8px;
                                        border-radius: 4px;
                                        border: 1px solid #f56c6c;
                                    "
                                >
                                    ⚠️ 預算不足：$ {{ remainingBudget.budgetShortfall.toLocaleString('en-US') }} 元
                                </div>
                                <div
                                    v-else
                                    style="
                                        font-size: 14px;
                                        color: #67c23a;
                                        font-weight: bold;
                                        background: #f0f9ff;
                                        padding: 6px 8px;
                                        border-radius: 4px;
                                        border: 1px solid #67c23a;
                                    "
                                >
                                    ✅ 預算充足，剩餘：$
                                    {{ (remainingBudget.totalIncome - remainingBudget.totalExpenses).toLocaleString('en-US') }} 元
                                </div>

                                <!-- 預算管理提示 -->
                                <div style="font-size: 11px; color: #909399; margin-top: 6px; text-align: center; padding: 4px">
                                    💡 點擊「設定月薪」按鈕可修改預算資料
                                </div>
                            </div>
                        </template>
                        <el-tag class="my-1" size="large" style="width: 100%; text-align: right"
                            >總計
                            <span style="font-size: 20px"> $ </span>
                            <span style="font-size: 24px; font-weight: bold">
                                <number
                                    :from="0"
                                    :to="assets"
                                    :format="currencyFormat"
                                    :duration="1"
                                    :delay="0"
                                    easing="Power1.easeOut"
                                /> </span
                            >&nbsp;元
                        </el-tag>
                    </el-tooltip>
                    <!-- <el-tag class="ml-2" size="small" style="margin: 1px 0px"
                        >股票損益 <span style="font-size: 20px; font-weight: bold">$ {{ assets.toLocaleString('en-US') }}</span>
                    </el-tag> -->
                    <br />
                    <!-- <span v-if="demandDeposit > 0" style="margin-right: 2px">
                        &nbsp;&nbsp;&nbsp;<el-tag type="info" class="ml-2" size="small" style="margin: 1px 0px"
                            >活存
                            <span style="font-size: 15px; font-weight: bold">$ {{ demandDeposit.toLocaleString('en-US') }}</span
                            ><span style="font-size: 10px"> 元</span>
                        </el-tag>
                    </span>
                    <span v-if="fixedDeposit > 0" style="margin-right: 2px">
                        <br />&nbsp;&nbsp;&nbsp;<el-tag type="info" class="ml-2" size="small" style="margin: 1px 0px"
                            >定存
                            <span style="font-size: 15px; font-weight: bold">$ {{ fixedDeposit.toLocaleString('en-US') }}</span
                            ><span style="font-size: 10px"> 元</span>
                        </el-tag>
                    </span>
                    <span v-if="stockDeposit > 0" style="margin-right: 2px">
                        <br />&nbsp;&nbsp;&nbsp;<el-tag type="info" class="ml-2" size="small" style="margin: 1px 0px"
                            >股票
                            <span style="font-size: 15px; font-weight: bold">$ {{ stockDeposit.toLocaleString('en-US') }}</span
                            ><span style="font-size: 10px"> 元</span>
                        </el-tag>
                    </span>
                    <span v-if="otherDeposit > 0" style="margin-right: 2px">
                        <br />&nbsp;&nbsp;&nbsp;<el-tag type="info" class="ml-2" size="small" style="margin: 1px 0px"
                            >其它
                            <span style="font-size: 15px; font-weight: bold">$ {{ otherDeposit.toLocaleString('en-US') }}</span
                            ><span style="font-size: 10px"> 元</span>
                        </el-tag>
                    </span> -->
                    <LineChart :chartData="lineData" :options="lineOptions" style="height: 100%" />
                </el-card>
            </el-col>
        </el-row>
        <el-row style="margin-bottom: 4px">
            <el-col :xs="12" :sm="10" :md="7" :lg="7" :xl="5" style="padding: 4px 2px 0 4px">
                <el-card shadow="hover" class="horizontal-bar pie-chart-container">
                    <!-- 浮動按鈕 -->
                    <el-button
                        :type="excludeStockSavings ? 'primary' : 'info'"
                        size="small"
                        @click="toggleStockSavings"
                        plain
                        class="floating-toggle-button"
                        circle
                        :title="excludeStockSavings ? '已排除存股，點擊包含存股' : '包含存股，點擊排除存股'"
                    >
                        <i :class="excludeStockSavings ? 'el-icon-view' : 'el-icon-remove-outline'"></i>
                    </el-button>
                    <PieChart :chartData="pieData" :options="pieOptions" />
                </el-card>
            </el-col>
            <el-col :xs="12" :sm="10" :md="7" :lg="7" :xl="5" style="padding: 4px 4px 0 2px">
                <el-card shadow="hover" class="horizontal-bar">
                    <BarChart :chartData="horizontalBarData" :options="horizontalBarOptions" />
                </el-card>
            </el-col>
        </el-row>
        <!-- <chart v-if="loaded" :chartdata="chartdata" :options="options"> </chart> -->
        <template v-for="(item, index) in spreadList" :key="index">
            <el-row style="margin-bottom: 1px">
                <el-col :xs="12" :sm="10" :md="7" :lg="7" :xl="5" style="padding-left: 4px">
                    <el-input
                        size="small"
                        placeholder=""
                        v-model="item.name"
                        :class="item.name.includes('債') ? 'bond-deposit-bg' : 'stock-deposit-bg'"
                        readonly
                        :style="{ 'pointer-events': 'none' }"
                    >
                        <template #prepend
                            ><span>{{ item.name.includes('債') ? '債券' : '股票' }}</span></template
                        >
                    </el-input>
                </el-col>
                <el-col :xs="9" :sm="10" :md="7" :lg="7" :xl="5" style="padding-left: 4px">
                    <ElCurrencyInput
                        size="small"
                        placeholder=""
                        v-model="item.cost.market_value"
                        :class="item.name.includes('債') ? 'bond-deposit-bg' : 'stock-deposit-bg'"
                        :is-stock="true"
                        :options="{
                            locale: 'en-US',
                            currency: 'USD',
                            currencyDisplay: 'hidden',
                            hideCurrencySymbolOnFocus: true,
                            hideGroupingSeparatorOnFocus: true,
                            hideNegligibleDecimalDigitsOnFocus: true,
                            autoDecimalDigits: false,
                            autoSign: true,
                            useGrouping: true,
                            accountingSign: false,
                        }"
                    />
                </el-col>
                <el-col :xs="3" :sm="10" :md="7" :lg="7" :xl="5" style="padding-left: 4px"> </el-col>
            </el-row>
        </template>
        <template v-for="(item, index) in assetList" :key="index">
            <el-row v-if="item.isPositive">
                <el-col :xs="12" :sm="10" :md="7" :lg="7" :xl="5" style="padding-left: 4px">
                    <el-input
                        size="small"
                        placeholder=""
                        v-model="item.account"
                        :ref="`deposit${index}`"
                        :class="[
                            item.account.includes('活存') || item.account.includes('現金')
                                ? 'demand-deposit-bg'
                                : item.account.includes('定存')
                                ? 'fixed-deposit-bg'
                                : item.account.includes('股票')
                                ? 'stock-deposit-bg'
                                : item.account.includes('存股')
                                ? 'cht-stock-deposit-bg'
                                : item.account.includes('債')
                                ? 'bond-deposit-bg'
                                : 'other-deposit-bg',
                        ]"
                        @change="onChangeAccount($event, index)"
                    >
                        <template #prepend
                            ><span>{{
                                item.account.includes('活存') || item.account.includes('現金')
                                    ? '現金'
                                    : item.account.includes('定存')
                                    ? '定存'
                                    : item.account.includes('存股')
                                    ? '存股'
                                    : '其它'
                            }}</span></template
                        >
                    </el-input>
                </el-col>
                <el-col :xs="9" :sm="10" :md="7" :lg="7" :xl="5" style="padding-left: 4px">
                    <ElCurrencyInput
                        size="small"
                        placeholder=""
                        v-model="item.amount"
                        :ref="`deposit2${index}`"
                        @keyup="onChangeAmount($event, index)"
                        :class="[
                            item.account.includes('活存') || item.account.includes('現金')
                                ? 'demand-deposit-bg'
                                : item.account.includes('定存')
                                ? 'fixed-deposit-bg'
                                : item.account.includes('股票')
                                ? 'stock-deposit-bg'
                                : item.account.includes('存股')
                                ? 'cht-stock-deposit-bg'
                                : item.account.includes('債')
                                ? 'bond-deposit-bg'
                                : 'other-deposit-bg',
                        ]"
                        :options="{
                            locale: 'en-US',
                            currency: 'USD',
                            currencyDisplay: 'hidden',
                            hideCurrencySymbolOnFocus: true,
                            hideGroupingSeparatorOnFocus: true,
                            hideNegligibleDecimalDigitsOnFocus: true,
                            autoDecimalDigits: false,
                            autoSign: true,
                            useGrouping: true,
                            accountingSign: false,
                        }"
                    />
                </el-col>
                <el-col :xs="3" :sm="3" :md="7" :lg="7" :xl="5" style="padding-left: 4px">
                    <el-button type="danger" size="small" @click="onDelAsset(index, item.account)" round plain
                        ><i class="el-icon-minus"></i
                    ></el-button>
                </el-col>
            </el-row>
        </template>
        <el-row>
            <el-col :xs="24" :sm="10" :md="7" :lg="6" :xl="5" style="padding: 2px 4px 5px 4px">
                <el-button type="primary" size="small" @click="onAddDeposit" round plain>
                    <i class="el-icon-plus"></i> 新增資產
                </el-button>
            </el-col>
            <!-- <el-col :xs="24" :sm="10" :md="7" :lg="7" :xl="3" style="padding-left: 4px; padding-top: 4px">
                <el-button type="primary" size="small" @click="onResetAsset" round><i class="el-icon-minus"></i></el-button>
            </el-col> -->
        </el-row>

        <template v-for="(item, index) in assetList" :key="index">
            <el-row v-if="!item.isPositive">
                <el-col :xs="12" :sm="10" :md="7" :lg="7" :xl="5" style="padding-left: 4px">
                    <el-input
                        size="small"
                        placeholder=""
                        v-model="item.account"
                        :ref="`debt${index}`"
                        class="liabilities-deposit-bg"
                        @change="onChangeAccount($event, index)"
                    >
                        <template #prepend>負債</template>
                    </el-input>
                </el-col>
                <el-col :xs="9" :sm="10" :md="7" :lg="7" :xl="5" style="padding-left: 4px">
                    <ElCurrencyInput
                        size="small"
                        placeholder=""
                        v-model="item.amount"
                        class="liabilities-deposit-bg"
                        @keyup="onChangeAmount($event, index)"
                        :options="{
                            locale: 'en-US',
                            currency: 'USD',
                            currencyDisplay: 'hidden',
                            hideCurrencySymbolOnFocus: true,
                            hideGroupingSeparatorOnFocus: true,
                            hideNegligibleDecimalDigitsOnFocus: true,
                            autoDecimalDigits: false,
                            autoSign: true,
                            useGrouping: true,
                            accountingSign: false,
                        }"
                    />
                </el-col>
                <el-col :xs="3" :sm="3" :md="7" :lg="7" :xl="5" style="padding-left: 4px">
                    <el-button type="danger" size="small" @click="onDelAsset(index, item.account)" round plain
                        ><i class="el-icon-minus"></i
                    ></el-button>
                </el-col>
            </el-row>
        </template>
        <el-row>
            <el-col :xs="24" :sm="10" :md="7" :lg="6" :xl="5" style="padding: 2px 4px 5px 4px">
                <el-button type="primary" size="small" @click="onAddDebt" round plain
                    ><i class="el-icon-plus"></i> 新增負債</el-button
                >
            </el-col>
            <!-- <el-col :xs="24" :sm="10" :md="7" :lg="7" :xl="3" style="padding-left: 4px; padding-top: 4px">
                <el-button type="primary" size="small" @click="onResetAsset" round><i class="el-icon-minus"></i></el-button>
            </el-col> -->
        </el-row>

        <!-- 還原功能區域 -->
        <el-row style="margin-bottom: 8px; padding: 0 4px">
            <el-col :span="24" style="text-align: left">
                <el-button type="warning" size="small" @click="onUndo" :disabled="!canUndo" round plain>
                    <i class="el-icon-refresh-left"></i> 還原 ({{ assetListHistory.length }}/20)
                </el-button>
                <el-button type="info" size="small" @click="onRedo" :disabled="!canRedo" round plain>
                    <i class="el-icon-refresh-right"></i> 重做
                </el-button>
            </el-col>
        </el-row>

        <div style="font-size: 14px; color: #999; margin: 20px">
            <div>
                【帳戶】請輸入帳戶名稱，輸入若包括關鍵字(活存|現金、
                定存)時會自動分類統計(現金、定存)至資產配置。股票則會自動同步。
            </div>
            <div>【$】請輸入帳戶目前金額。</div>
        </div>

        <el-row style="display: flex; flex-wrap: wrap">
            <el-col :xs="24" :sm="20" :md="14" :lg="14" :xl="10" style="display: flex; padding: 4px 2px 0 4px">
                <el-card shadow="hover" ref="leftCard" style="flex: 1">
                    <BarChart :chartData="bar2Data" :options="bar2Options" />
                </el-card>
            </el-col>
        </el-row>
        <el-row>
            <el-col :xs="24" :sm="10" :md="7" :lg="6" :xl="5" style="padding: 2px 4px 5px 4px">
                <el-button type="primary" size="small" @click="onAddInterest" round plain
                    ><i class="el-icon-plus"></i> 新增利息</el-button
                >
            </el-col>
        </el-row>
        <br />
        <el-row style="display: flex; flex-wrap: wrap">
            <el-col :xs="24" :sm="20" :md="14" :lg="14" :xl="10" style="display: flex; padding: 4px 2px 0 4px">
                <el-card shadow="hover" ref="leftCard" style="flex: 1">
                    <BarChart :chartData="bar3Data" :options="bar3Options" />
                </el-card>
            </el-col>
        </el-row>
        <br />

        <!-- 月薪輸入區域 - 長者友善按鈕 -->
        <el-row>
            <el-col :xs="24" :sm="12" :md="10" :lg="8" :xl="6" style="padding: 2px 4px 5px 4px">
                <el-button type="primary" size="small" @click="onSetMonthlySalary" round plain>
                    <i class="el-icon-money"></i> 設定月薪
                    <span v-if="monthlySalary > 0" style="margin-left: 8px; font-weight: bold">
                        ($ {{ monthlySalary.toLocaleString('en-US') }} 元)
                    </span>
                </el-button>
            </el-col>
        </el-row>
        <br /><br /><br />

        <FormInterest ref="childFormInterest" />
    </div>
</template>

<script>
import _ from 'lodash';
import moment from 'moment';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-moment';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { BarChart, PieChart, LineChart } from 'vue-chart-3';
import { ElMessageBox, ElMessage } from 'element-plus';
import ElCurrencyInput from '@/components/ElCurrencyInput.vue';
import FormInterest from '@/components/FormInterest.vue';

Chart.register(...registerables);
// Register the plugin to all charts:
Chart.register(ChartDataLabels);

export default {
    name: 'component-asset',
    // components: { highcharts: Chart },
    components: { ElCurrencyInput, BarChart, PieChart, LineChart, FormInterest },

    data() {
        return {
            assetList: [],
            assetListHistory: [], // 資產列表歷史記錄，最多保存20次
            currentHistoryIndex: -1, // 當前歷史記錄索引
            excludeStockSavings: true, // 是否排除存股
            monthlySalary: 76975, // 月薪 - 與 budgetData.monthlyIncome 同步

            // 年度預算相關數據
            budgetData: {
                monthlyIncome: 76975, // 每月月薪
                monthlyExpenses: [
                    { name: '給老婆', amount: 43999 },
                    { name: '給爸爸', amount: 3000 },
                    { name: '房貸', amount: 17500 },
                    { name: '車貸', amount: 23000 },
                    { name: '油費', amount: 3500 },
                ],
                oneTimeIncome: [
                    { name: '春節獎金1個月月薪', month: 1, day: 31, multiplier: 1 },
                    { name: '企業獎金0.5個月月薪', month: 1, day: 31, multiplier: 0.5 },
                    { name: '績效獎金2個月月薪', month: 1, day: 31, multiplier: 2 },
                    { name: '酬勞0.6個月月薪', month: 4, day: 30, multiplier: 0.6 },
                    { name: '企業化獎金1.6個月月薪', month: 5, day: 31, multiplier: 1.6 },
                    { name: '端午獎金0.3個月月薪', month: 6, day: 5, multiplier: 0.3 },
                    { name: '酬勞1個月月薪', month: 7, day: 15, multiplier: 1 },
                    { name: '中秋獎金0.3個月月薪', month: 9, day: 5, multiplier: 0.3 },
                ],
                oneTimeExpenses: [
                    { name: '紅包', month: 1, day: 31, amount: 102800 }, // 3600 * 1 = 3600。18000 * 5 = 90000 。4600 * 2 = 9200
                    { name: '健檢費用', month: 2, day: 5, amount: 15000 },
                    { name: '車子保險費', month: 3, day: 5, amount: 50000 },
                    { name: '我的實支實附保險費', month: 3, day: 5, amount: 23000 },
                    { name: '汽車牌照稅', month: 4, day: 5, amount: 11230 },
                    { name: '恬恬保險費', month: 4, day: 5, amount: 23000 },
                    { name: '芸芸保險費', month: 4, day: 5, amount: 33000 },
                    { name: '房屋稅', month: 5, day: 5, amount: 4983 },
                    { name: '房子火險', month: 5, day: 5, amount: 2000 },
                    { name: '汽車燃料稅', month: 7, day: 5, amount: 6180 },
                    { name: '出去玩', month: 8, day: 5, amount: 20000 },
                    { name: '地價稅', month: 11, day: 5, amount: 190 },
                    { name: '車保養', month: 12, day: 5, amount: 20000 },
                ],
            },

            lineOptions: {
                // 隱藏點
                elements: {
                    point: {
                        radius: 0,
                        hitRadius: 3,
                        hoverRadius: 5,
                    },
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'month',
                            displayFormats: {
                                quarter: '[Q]Q - YYYY',
                            },
                        },
                        ticks: {
                            callback: function (value, index, ticks) {
                                let showMonth = '';
                                if (value.includes('Jan')) showMonth = value.replace('Jan ', '') + '-1月';
                                else if (value.includes('Feb')) showMonth = '2月';
                                else if (value.includes('Mar')) showMonth = '3月';
                                else if (value.includes('Apr')) showMonth = '4月';
                                else if (value.includes('May')) showMonth = '5月';
                                else if (value.includes('Jun')) showMonth = '6月';
                                else if (value.includes('Jul')) showMonth = '7月';
                                else if (value.includes('Aug')) showMonth = '8月';
                                else if (value.includes('Sep')) showMonth = '9月';
                                else if (value.includes('Oct')) showMonth = '10月';
                                else if (value.includes('Nov')) showMonth = '11月';
                                else if (value.includes('Dec')) showMonth = '12月';
                                return showMonth;
                            },
                        },
                    },
                    y: {
                        ticks: {
                            suggestedMin: 0,
                            // min: 0, // it is for ignoring negative step.
                            // beginAtZero: true,
                            // stepSize: 100000,
                            callback(value, index, ticks) {
                                // console.log(ticks);
                                //有小數點就不顯示，可以是 step以0.5前進
                                if (value.toString().includes('.')) return '';
                                // 超過5個就顯示3個，所以最多有可能顯示4個
                                else if (ticks.length >= 6 && index % 3 >= 1) return '';
                                else if (ticks.length === 5 && index % 2 === 1) return '';
                                // 怕顯示萬結果都一樣
                                else if (ticks.length >= 6 && ticks[4].value - ticks[0].value >= 1000 && value >= 10000)
                                    return `$ ${Number((value / 10000).toFixed(1))} 萬`;
                                else if (ticks.length === 5 && ticks[2].value - ticks[0].value >= 1000 && value >= 10000)
                                    return `$ ${Number((value / 10000).toFixed(1))} 萬`;
                                else if (
                                    ticks.length < 5 &&
                                    ticks.length >= 2 &&
                                    ticks[1].value - ticks[0].value >= 1000 &&
                                    value >= 10000
                                )
                                    return `$ ${Number((value / 10000).toFixed(1))} 萬`;
                                // else if (ticks.length >= 2 && ticks[1].value - ticks[0].value < 1000)
                                //     return `$ ${value.toLocaleString('en-US')}`;
                                // else if (value >= 10000) return `$ ${Number((value / 10000).toFixed(1))} 萬`;
                                else return `$ ${value.toLocaleString('en-US')}`;
                            },
                        },
                    },
                },
                plugins: {
                    title: {
                        display: false,
                    },
                    datalabels: {
                        display: false,
                        // formatter: (value, ctx) => {
                        //     console.log(ctx);
                        //     let sum = 0;
                        //     const dataArr = ctx.chart.data.datasets[0].data;
                        //     dataArr.map((data) => {
                        //         sum += data;
                        //     });
                        //     const itemName = ['活存', '定存', '股票', '其它'];
                        //     console.log(value);
                        //     if (value === 0) return '';
                        //     const percentage = `  ${itemName[ctx.dataIndex]}\n${((value * 100) / sum).toFixed(2)} %`;
                        //     return percentage;
                        // },
                        // color: '#fff',
                    },
                    tooltip: {
                        callbacks: {
                            title(context) {
                                const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
                                return (
                                    moment(context[0].parsed.x).format('M/DD') +
                                    '(' +
                                    dayOfWeek[moment(context[0].parsed.x).day()] +
                                    ')'
                                );
                            },
                            label(context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y;
                                const diff = context.raw.diff || 0;
                                return ` ${label}: $ ${value.toLocaleString('en-US')} ( ${
                                    diff >= 0 ? '+' : ''
                                }${diff.toLocaleString('en-US')} )`;
                            },
                        },
                    },
                    legend: {
                        display: false,
                        // position: 'top',
                        // labels: {
                        //     usePointStyle: true,
                        //     padding: 6,
                        //     boxWidth: 10,
                        //     boxHeight: 10,
                        //     font: {
                        //         size: 11,
                        //     },
                        // },
                    },
                },
            },
        };
    },
    computed: {
        // 計算剩餘月份的預算資訊
        remainingBudget() {
            const now = new Date();
            const currentMonth = now.getMonth() + 1; // 1-12
            const currentYear = now.getFullYear();
            const remainingMonths = 12 - currentMonth + 1; // 包含當月

            // 計算剩餘月份固定收入（四捨五入到整數）
            const remainingFixedIncome = Math.round(this.budgetData.monthlyIncome * remainingMonths);

            // 計算剩餘月份固定支出（四捨五入到整數）
            const monthlyExpenseTotal = this.budgetData.monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
            const remainingFixedExpenses = Math.round(monthlyExpenseTotal * remainingMonths);

            // 計算剩餘月份一次性收入（四捨五入到整數）
            const remainingOneTimeIncome = Math.round(
                this.budgetData.oneTimeIncome
                    .filter((income) => income.month >= currentMonth)
                    .reduce((sum, income) => sum + this.budgetData.monthlyIncome * income.multiplier, 0)
            );

            // 計算剩餘月份一次性支出（含清單）
            const remainingOneTimeExpenses = this.budgetData.oneTimeExpenses.filter((expense) => expense.month >= currentMonth);

            const remainingOneTimeExpenseAmount = Math.round(
                remainingOneTimeExpenses.reduce((sum, expense) => sum + expense.amount, 0)
            );

            // 格式化一次性支出清單（金額四捨五入到整數）
            const oneTimeExpensesList = remainingOneTimeExpenses.map((expense) => {
                const date = new Date(currentYear, expense.month - 1, expense.day);
                return {
                    ...expense,
                    type: 'expense',
                    dateStr: `${expense.month}/${expense.day}`,
                    amountStr: `-${Math.round(expense.amount).toLocaleString('en-US')}`,
                };
            });

            // 格式化一次性收入清單（金額四捨五入到整數）
            const remainingOneTimeIncomeItems = this.budgetData.oneTimeIncome.filter((income) => income.month >= currentMonth);

            const oneTimeIncomeList = remainingOneTimeIncomeItems.map((income) => {
                const date = new Date(currentYear, income.month - 1, income.day);
                const amount = Math.round(this.budgetData.monthlyIncome * income.multiplier);
                return {
                    ...income,
                    type: 'income',
                    dateStr: `${income.month}/${income.day}`,
                    amountStr: `+${amount.toLocaleString('en-US')}`,
                };
            });

            // 合併收入和支出清單並按日期排序
            const oneTimeItemsList = [...oneTimeIncomeList, ...oneTimeExpensesList].sort(
                (a, b) => a.month - b.month || a.day - b.day
            );

            // 計算預算不足金額（四捨五入到整數）
            const totalIncome = remainingFixedIncome + remainingOneTimeIncome;
            const totalExpenses = remainingFixedExpenses + remainingOneTimeExpenseAmount;
            const budgetShortfall = Math.max(0, Math.round(totalExpenses - totalIncome));

            return {
                remainingMonths,
                remainingFixedIncome,
                remainingFixedExpenses,
                remainingOneTimeIncome,
                remainingOneTimeExpenseAmount,
                oneTimeItemsList,
                budgetShortfall,
                totalIncome,
                totalExpenses,
            };
        },
        canUndo() {
            return this.currentHistoryIndex > 0;
        },
        canRedo() {
            return this.currentHistoryIndex < this.assetListHistory.length - 1;
        },
        historyAssetList() {
            return this.$store.getters.getHistoryAssetList();
        },
        historyLiabilityList() {
            return this.$store.getters.getHistoryLiabilityList();
        },
        annualCloseOfHistoryAssetList() {
            // [
            //  ["2021-01-19", 858909],
            //  ["2021-01-20", 860678],
            //  ["2022-04-19", 858909],
            //  ["2022-04-20", 860678],
            //  ["2022-04-21", 859798],
            //  ["2023-12-20", 860678],
            //  ["2023-12-21", 859798],
            // ]
            // 我想用lodash 取得每年最後一天的值如下
            // [
            // ["2021-01-20", 860678],
            // ["2022-04-21", 859798],
            // ["2023-12-21", 859798],
            // ]

            // 將數據按年分組
            const groupedByYear = _.groupBy(this.$store.state.asset.historyAssetList, (item) => item[0].split('-')[0]);
            // 從每個組中選擇最後一項，僅取近6年
            return _.takeRight(
                _.map(groupedByYear, (group) => [group[0][0].split('-')[0], _.last(group)[1]]),
                3
            );
        },
        annualCloseOfHistoryLiabilityList() {
            // 取得每年最後一天的負債，若無則回傳 0，僅取近6年
            const groupedByYear = _.groupBy(this.$store.state.asset.historyLiabilityList, (item) => item[0].split('-')[0]);
            return _.takeRight(
                _.map(groupedByYear, (group) => [group[0][0].split('-')[0], _.last(group)[1]]),
                3
            );
        },
        todayAsset() {
            const historyAssetList = this.historyAssetList;
            if (_.size(historyAssetList) === 1) {
                return 0;
            }
            const last = _.last(historyAssetList);
            const secondLast = _.nth(historyAssetList, -2);
            const diff = last.y - secondLast.y;
            return diff;
        },
        spreadList() {
            return this.$store.getters.getSpreadList('目前', true);
        },
        stockList() {
            return this.$store.state.price.stockList;
        },
        storeAssetList() {
            return this.$store.state.asset.assetList;
        },
        assets() {
            const tempAssets =
                this.chtStockDeposit +
                this.stockDeposit +
                this.bondDeposit +
                this.assetList.reduce((acc, { account, amount, isPositive }) => {
                    console.log('amount', amount);
                    console.log('isPositive', isPositive);
                    console.log('acc', acc);
                    if (isPositive && !/存股|股票/.test(account)) return acc + amount;
                    return acc;
                }, 0);

            console.log('tempAssets', tempAssets);

            // 存到歷史存款去
            this.$store.commit('ADD_OR_UPDATE_HISTORY_ASSET_LIST', [
                moment().format('YYYY-MM-DD'), // 日期
                tempAssets, // 總存款
            ]);

            return tempAssets;
        },
        // 排除存股後的總資產
        assetsExcludingStockSavings() {
            return (
                this.stockDeposit +
                this.bondDeposit +
                this.assetList.reduce((acc, { account, amount, isPositive }) => {
                    if (isPositive && !/存股|股票/.test(account)) return acc + amount;
                    return acc;
                }, 0)
            );
        },
        // 新增：計算存股金額
        stockSavingsAmount() {
            return this.chtStockDeposit;
        },
        // 新增：計算可投資金額（現金-20萬）
        availableInvestmentAmount() {
            return Math.max(0, this.demandDeposit - 200000);
        },
        // 新增：計算年薪（月薪*19.7+4.8萬）
        annualSalary() {
            return Math.round(this.monthlySalary * 19.7 + 48000);
        },
        liabilities() {
            const tempLiabilities = this.assetList.reduce((acc, { amount, isPositive }) => {
                if (!isPositive) return acc + Math.abs(amount);
                return acc;
            }, 0);

            // 存到歷史負債去
            this.$store.commit('ADD_OR_UPDATE_HISTORY_LIABILITY_LIST', [
                moment().format('YYYY-MM-DD'), // 日期
                tempLiabilities, // 總負債
            ]);

            return tempLiabilities;
        },
        netAssets() {
            return this.assets - this.liabilities;
        },
        usAssets() {
            const tempAssets = this.assetList.reduce((acc, { account, amount, isPositive }) => {
                if (isPositive && account.includes('美金')) return acc + amount;
                return acc;
            }, 0);

            return tempAssets;
        },
        leverageAssetsd() {
            return ((this.liabilities * 100) / this.assets).toFixed(1);
        },
        demandDeposit() {
            // 活存 sum
            return this.assetList.reduce((acc, { account, amount }) => {
                if (account.includes('活存') || account.includes('現金')) return acc + Math.abs(amount);
                return acc;
            }, 0);
        },
        fixedDeposit() {
            // 定存 sum
            return this.assetList.reduce((acc, { account, amount }) => {
                if (account.includes('定存')) return acc + Math.abs(amount);
                return acc;
            }, 0);
        },
        stockDeposit() {
            const stockSum = this.$store.state.price.stockList.reduce(
                (acc, { name, cost }) => (!/債/.test(name) && cost?.sum ? acc + cost.sum + cost.return : acc),
                0
            );

            const assetSum = this.assetList.reduce(
                (acc, { account, amount, isPositive }) => (isPositive && /股票/.test(account) ? acc + Math.abs(amount) : acc),
                0
            );

            return stockSum + assetSum;
        },
        chtStockDeposit() {
            return this.assetList.reduce(
                (acc, { account, amount, isPositive }) => (isPositive && /存股/.test(account) ? acc + Math.abs(amount) : acc),
                0
            );
        },
        bondDeposit() {
            return this.$store.state.price.stockList.reduce(
                (acc, { name, cost }) => (/債/.test(name) && cost?.sum ? acc + cost.sum + cost.return : acc),
                0
            );
        },
        // fundDeposit() {
        //     // 定存 sum
        //     return this.assetList.reduce((acc, { account, amount }) => {
        //         if (account.includes('基金')) return acc + Math.abs(amount);
        //         return acc;
        //     }, 0);
        // },
        otherDeposit() {
            return this.assetList.reduce(
                (acc, { account, amount, isPositive }) =>
                    isPositive && !/定存|活存|現金|存股|股票/.test(account) ? acc + Math.abs(amount) : acc,
                0
            );
        },
        stockSumOfCostReturn() {
            return _.sumBy(this.spreadList, 'cost.return');
        },
        stockCostExistAndTop5List() {
            // 存在 cost 設定的股票名稱
            return _.orderBy(
                _.filter(this.$store.state.price.stockList, (o) => o.cost),
                ['cost.sum'],
                ['desc']
            ).slice(0, 5);
            // return this.$store.state.price.stockList, ['cost.sum'], ['desc']);
        },
        stockCostExistOfName() {
            // 存在 cost 設定的股票名稱
            return this.stockCostExistAndTop5List.reduce((acc, { name }) => {
                let tempName = name;
                tempName = tempName.replace('基金', '').replace('A2', '').replace('精選', '').replace('投資級企業債券', '債');
                acc.push(tempName);
                return acc;
            }, []);
        },
        // stockCostExistOfRateReturn() {
        //     // 存在 cost 設定的股票回報率
        //     return this.$store.state.price.stockList.reduce((acc, { cost }) => {
        //         if (cost && cost.rate_of_return) acc.push(cost.rate_of_return);
        //         return acc;
        //     }, []);
        // },
        stockCostExistOfReturn() {
            // 存在 cost 設定的股票回報金額
            return this.stockCostExistAndTop5List.reduce((acc, { cost }) => {
                acc.push(cost.return);
                return acc;
            }, []);
        },
        barData() {
            return {
                labels: ['資產', '負債'],
                datasets: [
                    {
                        data: [this.assets, this.liabilities],
                        backgroundColor: [
                            // 背景色
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 99, 132, 0.2)',
                        ],
                        borderColor: ['rgb(54, 162, 235)', 'rgb(255, 99, 132)'],
                        borderWidth: 2, // 外框寬度
                        options: {
                            legend: {
                                display: false,
                            },
                        },
                    },
                ],
            };
        },
        barOptions() {
            return {
                scales: {
                    y: {
                        ticks: {
                            callback(value, index, ticks) {
                                if (value >= 10000) return `$ ${Number((value / 10000).toFixed(1))} 萬`;
                                else return `$ ${value}`;
                            },
                        },
                    },
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    title: {
                        display: true,
                        text: `淨資產: $ ${Number((this.netAssets / 10000).toFixed(1))} 萬。桿杆率: ${this.leverageAssetsd}%`,
                        // align: 'start',
                        padding: {
                            top: 5,
                            bottom: 20,
                        },
                        // color: 'blue',
                    },
                    datalabels: {
                        anchor: 'end', // remove this line to get label in middle of the bar
                        align: 'end',
                        formatter: (val) => {
                            if (!val || val === 0) return '';
                            return `$ ${Number((val / 10000).toFixed(1))} 萬`;
                        },
                        labels: {
                            // value: {
                            //     color: 'blue',
                            // },
                        },
                    },
                    tooltip: {
                        callbacks: {
                            label(context) {
                                let label = context.dataset.label || '';

                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += `$ ${context.parsed.y.toLocaleString('en-US')}`;
                                }
                                return label;
                            },
                        },
                    },
                },
            };
        },
        pieOptions() {
            return {
                plugins: {
                    title: {
                        display: true,
                        // text: '資產配置',
                        text: `美金: $ ${Number((this.usAssets / 10000).toFixed(1))} 萬。占比: ${(
                            (this.usAssets * 100) /
                            this.assets
                        ).toFixed(1)}%`,
                        // align: 'start',
                        padding: {
                            top: 5,
                            bottom: 3,
                        },
                        // color: 'blue',
                    },
                    subtitle: {
                        display: true,
                        align: 'end',
                        position: 'bottom',
                        text: this.excludeStockSavings
                            ? [
                                  `【現金】${(this.demandDeposit / 10000).toFixed(1).padStart(5)} 萬  ` +
                                      `【定存】${(this.fixedDeposit / 10000).toFixed(1).padStart(5)} 萬`,
                                  `【股票】${(this.stockDeposit / 10000).toFixed(1).padStart(5)} 萬  ` +
                                      `【債券】${(this.bondDeposit / 10000).toFixed(1).padStart(5)} 萬`,
                                  `【其它】${(this.otherDeposit / 10000).toFixed(1).padStart(5)} 萬  ` +
                                      `(已排除存股 ${(this.chtStockDeposit / 10000).toFixed(1)} 萬)`,
                              ]
                            : [
                                  `【現金】${(this.demandDeposit / 10000).toFixed(1).padStart(5)} 萬  ` +
                                      `【定存】${(this.fixedDeposit / 10000).toFixed(1).padStart(5)} 萬`,
                                  `【存股】${(this.chtStockDeposit / 10000).toFixed(1).padStart(5)} 萬  ` +
                                      `【股票】${(this.stockDeposit / 10000).toFixed(1).padStart(5)} 萬`,
                                  `【債券】${(this.bondDeposit / 10000).toFixed(1).padStart(5)} 萬  ` +
                                      `【其它】${(this.otherDeposit / 10000).toFixed(1).padStart(5)} 萬`,
                              ],
                        font: {
                            size: 13,
                            family: '"PingFang TC", monospace',
                        },
                    },
                    datalabels: {
                        formatter: (value, ctx) => {
                            // console.log(ctx);

                            let sum = 0;
                            const dataArr = ctx.chart.data.datasets[0].data;
                            dataArr.map((data) => {
                                sum += data;
                            });
                            const itemName = this.excludeStockSavings
                                ? ['現金', '定存', '股票', '債券', '其它']
                                : ['現金', '定存', '存股', '股票', '債券', '其它'];
                            // console.log(value);
                            if (value === 0) return '';
                            const percentage = `  ${itemName[ctx.dataIndex]}\n${((value * 100) / sum).toFixed(2)} %`;
                            return percentage;
                        },
                        // color: '#fff',
                    },
                    tooltip: {
                        callbacks: {
                            label(context) {
                                // console.log(context);
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += `$ ${context.parsed.toLocaleString('en-US')}`;
                                }
                                return label;
                            },
                        },
                    },
                    legend: {
                        display: false,
                    },
                },
            };
        },
        horizontalBarData() {
            return {
                labels: this.stockCostExistOfName,
                datasets: [
                    {
                        data: this.stockCostExistOfReturn,
                        backgroundColor: [
                            // 背景色
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 244, 117, 0.2)',
                            'rgba(255, 189, 219, 0.2)',
                            'rgba(204, 255, 144, 0.2)',
                            'rgba(201, 203, 207, 0.2)',
                            'rgba(255, 159, 64, 0.2)',
                        ],
                        borderColor: [
                            'rgb(153, 102, 255)',
                            'rgb(168, 152, 32)',
                            'rgb(157, 86, 135)',
                            'rgba(103, 194, 58)',
                            'rgb(201, 203, 207)',
                            'rgba(255, 159, 64, 1)',
                        ],
                        borderWidth: 2, // 外框寬度
                        options: {
                            legend: {
                                display: false,
                            },
                        },
                    },
                ],
            };
        },
        horizontalBarOptions() {
            const { stockList, stockCostExistOfReturn } = this;
            const maxReturn = Math.max(...stockCostExistOfReturn);
            const minReturn = Math.min(...stockCostExistOfReturn);

            return {
                indexAxis: 'y',

                scales: {
                    x: {
                        min: minReturn < 0 ? minReturn : 0, // 如果最小值小於零，則設為最小值；否則設為零
                        max: maxReturn > 0 ? maxReturn : 0,
                        ticks: {
                            callback(value, index, ticks) {
                                if (Math.abs(value) >= 10000) return `$ ${Number((value / 10000).toFixed(1))} 萬`;
                                else if (Math.abs(value) >= 1000) {
                                    return `$ ${Number((value / 1000).toFixed(1))} 千`;
                                } else return `$ ${value}`;
                            },
                        },
                    },
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        callbacks: {
                            label(context) {
                                // console.log(context);
                                // console.log(stockList);
                                // console.log(this.stockList);
                                // 用股票名稱去找
                                const foundStock = _.find(stockList, (stock) => _.includes(stock.name, context.label));
                                // console.log(foundStock);

                                let label = context.dataset.label || '';

                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += ` 成本：$ ${foundStock.cost.sum.toLocaleString('en-US')} ( ${Number(
                                        foundStock.cost.rate_of_return.toFixed(1)
                                    )}% )`;
                                }
                                return label;
                            },
                        },
                    },
                    title: {
                        display: true,
                        // text: '股票本金 Top 5 的損益',
                        text: `股票損益。總計: $ ${this.stockSumOfCostReturn.toLocaleString('en-US')} 元`,
                        // align: 'start',
                        padding: {
                            top: 5,
                            bottom: 10,
                        },
                        // color: 'blue',
                    },
                    datalabels: {
                        clip: false, // 設為 false 避免數值被截斷
                        anchor: 'center',
                        align: 'end',
                        offset: -2,
                        formatter: (val) => {
                            if (!val || val === 0) return '';
                            return `$ ${Number(val.toFixed(1)).toLocaleString('en-US')}`;
                        },
                        labels: {
                            // value: {
                            //     color: 'blue',
                            // },
                        },
                    },
                },
            };
        },
        pieData() {
            if (this.excludeStockSavings) {
                // 排除存股的版本
                return {
                    labels: ['活存', '定存', '股票', '債券', '其它'],
                    datasets: [
                        {
                            data: [this.demandDeposit, this.fixedDeposit, this.stockDeposit, this.bondDeposit, this.otherDeposit],
                            backgroundColor: [
                                // 背景色
                                'rgba(255, 205, 86, 0.5)',
                                'rgba(255, 159, 64, 0.5)',
                                'rgba(66, 202, 162, 0.4)',
                                'rgba(200, 160, 255, 0.4)',
                                'rgba(200, 200, 200, 0.2)', // 灰色
                            ],
                            // borderColor: ['rgb(66, 66, 66)'],
                            borderWidth: 2, // 外框寬度
                        },
                    ],
                };
            } else {
                // 包含存股的版本（原版本）
                return {
                    labels: ['活存', '定存', '存股', '股票', '債券', '其它'],
                    datasets: [
                        {
                            data: [
                                this.demandDeposit,
                                this.fixedDeposit,
                                this.chtStockDeposit,
                                this.stockDeposit,
                                this.bondDeposit,
                                this.otherDeposit,
                            ],
                            backgroundColor: [
                                // 背景色
                                'rgba(255, 205, 86, 0.5)',
                                'rgba(255, 159, 64, 0.5)',
                                'rgba(204, 255, 144, 0.5)',
                                'rgba(66, 202, 162, 0.4)',
                                'rgba(200, 160, 255, 0.4)',
                                'rgba(200, 200, 200, 0.2)', // 灰色
                            ],
                            // borderColor: ['rgb(66, 66, 66)'],
                            borderWidth: 2, // 外框寬度
                        },
                    ],
                };
            }
        },
        lineData() {
            return {
                // labels: ['2022-04-01', '2022-04-02', '2022-04-03'],
                datasets: [
                    {
                        label: '資產',
                        data: this.historyAssetList,
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderWidth: 2, // 外框寬度
                        fill: true /* this option hide background-color */,
                    },
                    {
                        label: '負債',
                        data: this.historyLiabilityList,
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderWidth: 2, // 外框寬度
                        fill: true /* this option hide background-color */,
                    },
                ],
            };
        },

        annualPassiveIncome() {
            const currentYear = moment().year();
            // 過濾最近的五年
            const spreadData = this.$store.state.dividend.historySpreadList.filter(
                (item) => moment(item.sell_date).year() >= currentYear - 4
            );
            const spreadResult = _(spreadData)
                .groupBy((item) => moment(item.sell_date).format('YYYY'))
                .map((group, year) => ({ year, sumSpread: _.sumBy(group, 'sell_return') }))
                .value();

            // 過濾最近的五年
            const dividendData = this.$store.state.dividend.historyDividendList.filter(
                (item) => moment(item.payment_date).year() >= currentYear - 4
            );
            const dividendResult = _(dividendData)
                .groupBy((item) => moment(item.payment_date).format('YYYY'))
                .map((group, year) => ({
                    year,
                    sumDividend: _.sumBy(group, (item) => Math.round(item.number_of_shares * item.earnings_distribution)),
                }))
                .value();

            // 過濾最近的五年
            const interestData = this.$store.state.asset.interestList.filter(
                (item) => moment(item.date).year() >= currentYear - 4
            );
            const interestResult = _(interestData)
                .groupBy((item) => moment(item.date).format('YYYY'))
                .map((group, year) => ({
                    year,
                    sumInterest: _.sumBy(group, 'interest'),
                }))
                .value();
            // console.log(spreadResult);
            // console.log(dividendResult);
            // console.log(interestResult);
            // 整合 spreadData 和 dividendData，但這是價差年去找配息也許會有可能找不到，不過應該每年都有賣吧
            const integratedData = spreadResult.map((spreadItem) => {
                const matchingDividendItem = dividendResult.find((dividendItem) => dividendItem.year === spreadItem.year);
                const matchingInterestItem = interestResult.find((interestItem) => interestItem.year === spreadItem.year);

                return {
                    year: spreadItem.year,
                    sumSpread: spreadItem.sumSpread || 0,
                    sumDividend: matchingDividendItem ? matchingDividendItem.sumDividend || 0 : 0,
                    sumInterest: matchingInterestItem ? matchingInterestItem.sumInterest || 0 : 0,
                    total:
                        (spreadItem.sumSpread || 0) +
                        (matchingDividendItem ? matchingDividendItem.sumDividend || 0 : 0) +
                        (matchingInterestItem ? matchingInterestItem.sumInterest || 0 : 0),
                };
            });
            return integratedData;
        },
        bar2Data() {
            const years = _.map(this.annualPassiveIncome, (item) => `${item.year} 年`);
            const totals = _.map(this.annualPassiveIncome, 'total');
            const sumSpread = _.map(this.annualPassiveIncome, 'sumSpread');
            const sumDividend = _.map(this.annualPassiveIncome, 'sumDividend');
            const sumInterest = _.map(this.annualPassiveIncome, 'sumInterest');

            // if (foundObj.sumSpread) label += `價差 $ ${foundObj.sumSpread.toLocaleString('en-US')}`;
            // if (foundObj.sumDividend) label += `; 股利 $ ${foundObj.sumDividend.toLocaleString('en-US')}`;
            // if (foundObj.sumInterest) label += `; 利息 $ ${foundObj.sumInterest.toLocaleString('en-US')}`;
            return {
                labels: years,
                datasets: [
                    {
                        data: sumSpread,
                        backgroundColor: 'rgb(212, 241, 241)',
                        borderColor: 'rgba(100, 199, 200, 1)',
                        borderWidth: 2, // 外框寬度
                        options: {
                            legend: {
                                display: false,
                            },
                        },
                    },
                    {
                        data: sumDividend,
                        backgroundColor: 'rgb(232, 214, 255)',
                        borderColor: 'rgb(156, 110, 254)',
                        borderWidth: 2, // 外框寬度
                        options: {
                            legend: {
                                display: false,
                            },
                        },
                    },
                    {
                        data: sumInterest,
                        backgroundColor: 'rgba(255, 159, 64, 0.2)',
                        borderColor: 'rgb(255, 159, 64)',
                        borderWidth: 2, // 外框寬度
                        options: {
                            legend: {
                                display: false,
                            },
                        },
                    },
                ],
            };
        },
        bar2Options() {
            const { annualPassiveIncome } = this;
            return {
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true,
                        ticks: {
                            callback(value, index, ticks) {
                                if (value >= 10000) return `$ ${Number((value / 10000).toFixed(1))} 萬`;
                                else return `$ ${value}`;
                            },
                        },
                    },
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    title: {
                        display: true,
                        text: `歷年被動收入`,
                        // align: 'start',
                        padding: {
                            top: 5,
                            bottom: 20,
                        },
                        // color: 'blue',
                    },
                    datalabels: {
                        anchor: 'end', // remove this line to get label in middle of the bar
                        align: 'start',
                        formatter: (val, context) => {
                            // console.log(context);
                            let name = '';

                            if (context.datasetIndex === 0) name = '價差';
                            else if (context.datasetIndex === 1) name = '股利';
                            else if (context.datasetIndex === 2) name = '利息';

                            if (!val || val === 0) return '';
                            else if (val > 100000) return `${name} $ ${Number((val / 10000).toFixed(1))} 萬`;
                            else return `${name} $ ${Number(val.toFixed(1)).toLocaleString('en-US')} 元`;
                        },
                        labels: {
                            // value: {
                            //     color: 'blue',
                            // },
                        },
                    },
                    tooltip: {
                        callbacks: {
                            label(context) {
                                const xLabel = context.label; // 取出 '2023 年'
                                const year = xLabel.split(' ')[0]; // 取出 '2023'
                                var foundObj = _.find(annualPassiveIncome, { year: year });
                                // console.log(foundObj);
                                let label = '';
                                if (foundObj.total) label += `總計 $ ${foundObj.total.toLocaleString('en-US')}`;
                                label += ' ( ';
                                if (foundObj.sumSpread) label += `價差 $ ${foundObj.sumSpread.toLocaleString('en-US')}`;
                                if (foundObj.sumDividend) label += `; 股利 $ ${foundObj.sumDividend.toLocaleString('en-US')}`;
                                if (foundObj.sumInterest) label += `; 利息 $ ${foundObj.sumInterest.toLocaleString('en-US')}`;
                                label += ' )';
                                return label;
                            },
                        },
                    },
                },
            };
        },
        bar3Data() {
            // 年度資產/負債對比條狀圖
            const assetList = this.annualCloseOfHistoryAssetList;
            const liabilityList = this.annualCloseOfHistoryLiabilityList;
            const years = _.uniq([...assetList.map((a) => a[0]), ...liabilityList.map((l) => l[0])]);
            const sortedYears = _.sortBy(years);
            const assetData = sortedYears.map((year) => {
                const found = assetList.find((a) => a[0] === year);
                return found && typeof found[1] === 'number' && isFinite(found[1]) ? found[1] : 0;
            });
            const liabilityData = sortedYears.map((year) => {
                const found = liabilityList.find((l) => l[0] === year);
                return found && typeof found[1] === 'number' && isFinite(found[1]) ? found[1] : 0;
            });
            return {
                labels: sortedYears.map((y) => y + ' 年'),
                datasets: [
                    {
                        label: '資產',
                        data: assetData,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgb(54, 162, 235)',
                        borderWidth: 2,
                    },
                    {
                        label: '負債',
                        data: liabilityData,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgb(255, 99, 132)',
                        borderWidth: 2,
                    },
                ],
            };
        },
        bar3Options() {
            return {
                scales: {
                    x: {
                        stacked: false,
                    },
                    y: {
                        stacked: false,
                        ticks: {
                            callback(value) {
                                if (value >= 10000) return `$ ${Number((value / 10000).toFixed(1))} 萬`;
                                else return `$ ${value}`;
                            },
                        },
                    },
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    title: {
                        display: true,
                        text: `歷年資產/負債結算`,
                        padding: {
                            top: 5,
                            bottom: 20,
                        },
                    },
                    datalabels: {
                        anchor: 'end', // remove this line to get label in middle of the bar
                        align: 'start',
                        formatter: (val, context) => {
                            if (!val || val === 0) return '';
                            else if (val > 100000) return `$ ${Number((val / 10000).toFixed(1))} 萬`;
                            else return `$ ${Number(val.toFixed(1)).toLocaleString('en-US')} 元`;
                        },
                        labels: {
                            // value: {
                            //     color: 'blue',
                            // },
                        },
                    },
                },
            };
        },
    },
    created() {
        // console.log('created asset');
        // 取得 localstorage 自選股，最先開始是 null 時，會給予預設值空矩陣

        const localAssetList = JSON.parse(localStorage.getItem('assetList')) || [];
        // console.log(localAssetList);
        if (_.isEmpty(localAssetList)) {
            localAssetList.push;
            localStorage.setItem('assetList', JSON.stringify(localAssetList)); // 將 localStockList 從 object 轉 string 後塞到 localstorage
        }

        this.$store.commit('SAVE_ASSET', localAssetList);

        // localstorage 儲存是有負值，在這要轉成無負債
        this.assetList = localAssetList.reduce((acc, { account, amount }) => {
            acc.push({ account: account, amount: Math.abs(amount), isPositive: amount >= 0 });
            return acc;
        }, []);

        // 載入月薪設定
        const savedMonthlySalary = localStorage.getItem('monthlySalary');
        if (savedMonthlySalary) {
            this.monthlySalary = parseInt(savedMonthlySalary, 10);
            this.budgetData.monthlyIncome = this.monthlySalary; // 同步到預算資料
        }
        // console.log('created asset over!');

        // 歷史存款
        const localHistoryAssetList = JSON.parse(localStorage.getItem('historyAssetList')) || [];
        this.$store.commit('SAVE_HISTORY_ASSET_LIST', localHistoryAssetList);

        // 歷史負債
        const localHistoryLiabilityList = JSON.parse(localStorage.getItem('historyLiabilityList')) || [];
        this.$store.commit('SAVE_HISTORY_LIABILITY_LIST', localHistoryLiabilityList);

        // 利息清單，這也有點算歷史，因為每年都有
        const localInterestList = JSON.parse(localStorage.getItem('interestList')) || [];
        this.$store.commit('SAVE_INTEREST', localInterestList);

        // 初始化歷史記錄
        this.initializeHistory();

        // 初始化 debounced 保存歷史記錄的方法
        this.debouncedSaveHistory = _.debounce(this.saveToHistory, 1000);
    },
    methods: {
        // 初始化歷史記錄
        initializeHistory() {
            // 從 localStorage 載入歷史記錄
            const savedHistory = JSON.parse(localStorage.getItem('assetListHistory')) || [];
            this.assetListHistory = savedHistory;
            this.currentHistoryIndex = savedHistory.length - 1;

            // 如果沒有歷史記錄，保存當前狀態作為第一個記錄
            if (this.assetListHistory.length === 0) {
                this.saveToHistory();
            }
        },

        // 保存當前狀態到歷史記錄
        saveToHistory() {
            // 深拷貝當前 assetList
            const currentState = JSON.parse(JSON.stringify(this.assetList));

            // 如果當前不是最新狀態（即用戶執行了 undo），則刪除後面的記錄
            if (this.currentHistoryIndex < this.assetListHistory.length - 1) {
                this.assetListHistory.splice(this.currentHistoryIndex + 1);
            }

            // 添加新的狀態
            this.assetListHistory.push(currentState);

            // 保持最多20個記錄
            if (this.assetListHistory.length > 20) {
                this.assetListHistory.shift();
            } else {
                this.currentHistoryIndex++;
            }

            // 保存到 localStorage
            localStorage.setItem('assetListHistory', JSON.stringify(this.assetListHistory));
        },

        // 還原上一個狀態
        onUndo() {
            if (this.canUndo) {
                this.currentHistoryIndex--;
                this.restoreFromHistory();
                ElMessage({
                    type: 'success',
                    message: `已還原到第 ${this.currentHistoryIndex + 1} 個狀態`,
                });
            }
        },

        // 重做下一個狀態
        onRedo() {
            if (this.canRedo) {
                this.currentHistoryIndex++;
                this.restoreFromHistory();
                ElMessage({
                    type: 'success',
                    message: `已重做到第 ${this.currentHistoryIndex + 1} 個狀態`,
                });
            }
        },

        // 從歷史記錄恢復狀態
        restoreFromHistory() {
            if (this.currentHistoryIndex >= 0 && this.currentHistoryIndex < this.assetListHistory.length) {
                // 深拷貝歷史狀態
                this.assetList = JSON.parse(JSON.stringify(this.assetListHistory[this.currentHistoryIndex]));

                // 更新 store 和 localStorage
                this.$store.commit('SAVE_ASSET', this.chgAssetListBrief(this.assetList));
            }
        },

        onAddDeposit() {
            console.log('onAddDeposit');

            const index = this.assetList.push({
                account: '',
                amount: 0,
                isPositive: true,
            });

            // 保存到歷史記錄
            this.saveToHistory();

            this.$nextTick(() => {
                this.$refs[`deposit${index - 1}`][0].focus();
            });
        },
        onAddDebt() {
            console.log('onAddDebt');

            const index = this.assetList.push({
                account: '',
                amount: 0,
                isPositive: false,
            });

            // 保存到歷史記錄
            this.saveToHistory();

            this.$nextTick(() => {
                this.$refs[`debt${index - 1}`][0].focus();
            });
        },
        onDelAsset(index, assetName) {
            // console.log(index);
            if (assetName) {
                ElMessageBox.confirm(`將要刪除[${assetName}]?`, '刪除', {
                    confirmButtonText: '刪除',
                    cancelButtonText: '取消',
                    type: 'warning',
                })
                    .then(() => {
                        this.assetList.splice(index, 1);
                        this.$store.commit('SAVE_ASSET', this.chgAssetListBrief(this.assetList));

                        // 保存到歷史記錄
                        this.saveToHistory();

                        ElMessage({
                            type: 'success',
                            message: '完成刪除!',
                        });
                    })
                    .catch(() => {
                        ElMessage({
                            type: 'info',
                            message: '取消刪除!',
                        });
                    });
            } else {
                // 沒有名稱，可能剛新增就想刪，就直接刪
                this.assetList.splice(index, 1);
                this.$store.commit('SAVE_ASSET', this.chgAssetListBrief(this.assetList));

                // 保存到歷史記錄
                this.saveToHistory();
            }
        },
        onAddInterest() {
            this.$refs.childFormInterest.onInit();
        },
        onResetAsset() {
            localStorage.removeItem('assetList');
            localStorage.removeItem('dividendList');
            localStorage.removeItem('crawlerDividendLastDate');

            // 清除歷史記錄
            localStorage.removeItem('assetListHistory');
            this.assetListHistory = [];
            this.currentHistoryIndex = -1;
        },
        onChangeAccount(e, index) {
            // console.log('onChangeAccount');
            // console.log(index);
            // console.log(e);
            // console.log(e.target.value);
            this.assetList[index].account = e;
            this.$store.commit('SAVE_ASSET', this.chgAssetListBrief(this.assetList));

            // 使用 debounce 延遲保存歷史記錄，避免每次輸入都保存
            this.debouncedSaveHistory();
        },
        onChangeAmount(e, index) {
            // console.log('onChangeAmount');
            // console.log(index);
            // console.log(e.target.value);
            this.assetList[index].amount = e.target.value ? parseInt(e.target.value, 10) : 0;
            this.$store.commit('SAVE_ASSET', this.chgAssetListBrief(this.assetList));

            // 使用 debounce 延遲保存歷史記錄，避免每次輸入都保存
            this.debouncedSaveHistory();
        },
        // 月薪變更處理
        onMonthlySalaryChange() {
            localStorage.setItem('monthlySalary', this.monthlySalary.toString());
        },
        // 設定月薪（彈出輸入框）
        async onSetMonthlySalary() {
            try {
                const { value } = await ElMessageBox.prompt('請輸入月薪金額', '設定月薪', {
                    confirmButtonText: '確定',
                    cancelButtonText: '取消',
                    inputPattern: /^\d+$/,
                    inputErrorMessage: '請輸入有效的數字',
                    inputValue: this.monthlySalary > 0 ? this.monthlySalary.toString() : '',
                    inputPlaceholder: '請輸入月薪（僅數字）',
                });

                const newSalary = parseInt(value, 10);
                if (newSalary >= 0) {
                    this.monthlySalary = newSalary;
                    // 同步更新預算資料中的月薪
                    this.budgetData.monthlyIncome = newSalary;
                    localStorage.setItem('monthlySalary', this.monthlySalary.toString());

                    ElMessage({
                        type: 'success',
                        message: `月薪已設定為 $ ${this.monthlySalary.toLocaleString('en-US')} 元，預算計算已同步更新`,
                    });
                }
            } catch (error) {
                // 取消或出錯時不做任何操作
            }
        },
        // 切換是否排除存股
        toggleStockSavings() {
            this.excludeStockSavings = !this.excludeStockSavings;
        },
        // onChangeDepositAmount(e, index) {
        //     console.log('onChangeAmount');
        //     console.log(index);
        //     // this.assetList[index].amount = e.target.value ? parseInt(e.target.value, 10) : 0;
        //     // this.$store.commit('SAVE_ASSET', this.assetList);
        // },
        // onChangeDebtAmount(e, index) {
        //     console.log('onChangeAmount');
        //     console.log(e);
        //     this.assetList[index].amount = e.target.value ? -parseInt(e.target.value, 10) : -1000;
        //     this.$store.commit('SAVE_ASSET', this.assetList);
        // },
        onClickSelectAll(index) {
            this.$refs[`amount${index}`][0].select();
        },
        currencyFormat(number) {
            return Number(number.toFixed(0)).toLocaleString('en-US');
        },
        chgAssetListBrief(assetList) {
            return assetList.reduce((acc, { account, amount, isPositive }) => {
                if (isPositive) acc.push({ account: account, amount: amount });
                else acc.push({ account: account, amount: -amount });
                return acc;
            }, []);
        },
    },
};
</script>

<style lang="sass">
.el-input-group__prepend
    padding: 0 10px!important
.el-card__body
    padding: 3px
.horizontal-bar .el-card__body
    padding: 3px 2px
#line-chart
    height: 133px

.demand-deposit-bg > .el-input-group__prepend
    background: rgba(255, 205, 86, 0.5)
.fixed-deposit-bg > .el-input-group__prepend
    background: rgba(255, 159, 64, 0.5)
.stock-deposit-bg > .el-input-group__prepend
    background: rgba(66, 202, 162, 0.4)
.cht-stock-deposit-bg > .el-input-group__prepend
    background: rgba(204, 255, 144, 0.5)
.stock-deposit-bg > input
    background: #f7f7f7
.bond-deposit-bg > .el-input-group__prepend
    background: rgba(200, 160, 255, 0.4)
.bond-deposit-bg > input
    background: #f7f7f7
.other-deposit-bg > .el-input-group__prepend
    background: rgba(200, 200, 200, 0.2)
.liabilities-deposit-bg > .el-input-group__prepend
    background: rgba(255, 99, 132, 0.2)
#line-chart-card > .el-card__body
    height: calc(100% - 61px)

// 圓餅圖容器樣式
.pie-chart-container
    position: relative

// 浮動切換按鈕樣式
.floating-toggle-button
    position: absolute !important
    top: 23px
    right: 4px
    z-index: 10
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15)
    border-radius: 4px
</style>
