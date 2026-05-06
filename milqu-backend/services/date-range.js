function startOfDay(date) {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    return next;
}

function endOfDay(date) {
    const next = new Date(date);
    next.setHours(23, 59, 59, 999);
    return next;
}

function getCalendarRange(period, now = new Date()) {
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    switch (period) {
        case 'today':
            return { start: todayStart, end: todayEnd, key: period };
        case 'yesterday': {
            const start = new Date(todayStart);
            start.setDate(start.getDate() - 1);
            const end = new Date(todayEnd);
            end.setDate(end.getDate() - 1);
            return { start, end, key: period };
        }
        case 'week': {
            const start = new Date(todayStart);
            start.setDate(start.getDate() - 6);
            return { start, end: todayEnd, key: period };
        }
        case 'month': {
            const start = new Date(todayStart);
            start.setDate(1);
            return { start, end: todayEnd, key: period };
        }
        case 'year': {
            const start = new Date(todayStart);
            start.setMonth(0, 1);
            return { start, end: todayEnd, key: period };
        }
        case '7d': {
            const start = new Date(todayStart);
            start.setDate(start.getDate() - 6);
            return { start, end: todayEnd, key: period };
        }
        case '30d': {
            const start = new Date(todayStart);
            start.setDate(start.getDate() - 29);
            return { start, end: todayEnd, key: period };
        }
        case '3m': {
            const start = new Date(todayStart);
            start.setMonth(start.getMonth() - 3);
            return { start, end: todayEnd, key: period };
        }
        case '12m': {
            const start = new Date(todayStart);
            start.setFullYear(start.getFullYear() - 1);
            return { start, end: todayEnd, key: period };
        }
        default:
            return { start: todayStart, end: todayEnd, key: 'today' };
    }
}

function getDateRange(options = {}) {
    const { period = 'today', from, to, now = new Date() } = options;

    if (from && to) {
        const start = startOfDay(new Date(from));
        const end = endOfDay(new Date(to));
        return { start, end, key: 'custom' };
    }

    return getCalendarRange(period, now);
}

function getPreviousPeriod(range) {
    const duration = range.end.getTime() - range.start.getTime();
    const end = new Date(range.start.getTime() - 1);
    const start = new Date(end.getTime() - duration);
    return { start, end, key: 'previous' };
}

function getMonthComparisonRanges(now = new Date()) {
    const current = getCalendarRange('month', now);
    const previousStart = new Date(current.start);
    previousStart.setMonth(previousStart.getMonth() - 1);
    const previousEnd = new Date(current.start.getTime() - 1);
    previousEnd.setHours(23, 59, 59, 999);
    return { current, previous: { start: previousStart, end: previousEnd, key: 'prev-month' } };
}

function getWeekComparisonRanges(now = new Date()) {
    const current = getCalendarRange('week', now);
    const previousEnd = new Date(current.start.getTime() - 1);
    const previousStart = new Date(previousEnd);
    previousStart.setDate(previousStart.getDate() - 6);
    previousStart.setHours(0, 0, 0, 0);
    return { current, previous: { start: previousStart, end: previousEnd, key: 'prev-week' } };
}

function getYearOverYearRanges(now = new Date()) {
    const current = getCalendarRange('year', now);
    const previousStart = new Date(current.start);
    previousStart.setFullYear(previousStart.getFullYear() - 1);
    const previousEnd = new Date(current.end);
    previousEnd.setFullYear(previousEnd.getFullYear() - 1);
    return { current, previous: { start: previousStart, end: previousEnd, key: 'prev-year' } };
}

module.exports = {
    endOfDay,
    getCalendarRange,
    getDateRange,
    getMonthComparisonRanges,
    getPreviousPeriod,
    getWeekComparisonRanges,
    getYearOverYearRanges,
    startOfDay
};
