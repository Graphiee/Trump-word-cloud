let transcriptText = `
0.0 - 6.119999885559082:  As the President of the United States, it's my tremendous honor to finally wish America
6.119999885559082 - 10.680000305175781:  and the world a very Merry Christmas.
10.680000305175781 - 17.68000030517578:  For Christians, this is a holy season, the celebration of the birth of our Lord and Savior
17.68000030517578 - 19.5:  Jesus Christ.
19.5 - 24.31999969482422:  More than 2,000 years ago, the angel Gabriel appeared to Mary.
24.31999969482422 - 30.360000610351562:  He said, do not be afraid, you have found favor with God.
30.360000610351562 - 35.91999816894531:  The angel told her that she would give birth to a baby boy, Jesus, who would be called
35.91999816894531 - 38.63999938964844:  the Son of the Most High.
38.63999938964844 - 42.91999816894531:  Nine months later, Christ was born in the town of Bethlehem.
42.91999816894531 - 46.68000030517578:  The Son of God came into the world in a humble stable.
46.68000030517578 - 53.2400016784668:  Whatever our beliefs, we know that the birth of Jesus Christ and the story of this incredible
53.2400016784668 - 58.720001220703125:  life forever changed the course of human history.
58.720001220703125 - 65.95999908447266:  There's hardly an aspect of our lives today that his life has not touched art, music,
65.95999908447266 - 73.87999725341797:  culture, law, and our respect for the sacred dignity of every person, everywhere in the
73.87999725341797 - 74.87999725341797:  world.
74.87999725341797 - 83.19999694824219:  At Christmas, we give thanks to God and that God sent his only Son to die for us and to
83.19999694824219 - 86.16000366210938:  offer everlasting peace to all humanity.
86.16000366210938 - 94.23999786376953:  We recognize that the real spirit of Christmas is not what we have, it's about who we are.
94.23999786376953 - 99.45999908447266:  Each one of us is a child of God.
99.45999908447266 - 104.0:  That is the true source of joy this time of the year.
104.12000274658203 - 108.44000244140625:  That is what makes every Christmas merry.
108.44000244140625 - 114.16000366210938:  Above all, during the sacred season, our souls are full of thanks and praise for almighty
114.16000366210938 - 121.16000366210938:  God for sending us Christ, his Son, to redeem the world.
121.16000366210938 - 126.63999938964844:  Tonight we ask that God will continue to bless this nation and we pray that he will grant
126.63999938964844 - 132.0800018310547:  every American family a Christmas season full of joy, hope, and peace.
`;

let topicsText = `
Topic 1: 0:00 - 0:10 Introduction and Christmas Greeting
Topic 2: 0:10 - 0:38 The Story of Angel Gabriel
Topic 3: 0:38 - 0:58 Birth of Jesus and Historical Impact
Topic 4: 0:58 - 1:14 Impact on Modern Life
Topic 5: 1:14 - 2:12 Christmas Message and Blessing
`;

// Get dimensions for word cloud
const width = document.getElementById("word-cloud").offsetWidth;
const height = document.getElementById("word-cloud").offsetHeight;

// Convert MM:SS to seconds
function parseTime(timeStr) {
	if (!timeStr) return 0;
	const [mins, secs] = timeStr.split(":").map(Number);
	return mins * 60 + secs;
}

// Parse topics
const topics = topicsText
	.trim()
	.split("\n")
	.map((line) => {
		try {
			const [topic, rest] = line.split(": ");
			if (!rest) return null;

			const parts = rest.split(" ");
			const timeRange = parts[0] + " " + parts[1] + " " + parts[2];
			const [startTime, endTime] = timeRange.split(" - ");
			const description = parts.slice(3).join(" ");

			return {
				topic,
				start: parseTime(startTime),
				end: parseTime(endTime),
				description,
			};
		} catch (e) {
			console.error("Error parsing topic:", line, e);
			return null;
		}
	})
	.filter(Boolean);

// Create topic buttons
const topicsList = document.getElementById("topics-list");
topics.forEach((topic, index) => {
	const button = document.createElement("button");
	button.className = "topic-button";
	button.textContent = `${topic.topic}`;
	button.title = topic.description;
	button.addEventListener("click", () => {
		document
			.querySelectorAll(".topic-button")
			.forEach((btn) => btn.classList.remove("active"));
		button.classList.add("active");
		rangeSlider.noUiSlider.set([topic.start, topic.end]);
	});
	topicsList.appendChild(button);
});

// Parse transcript into segments with timestamps
const segments = transcriptText
	.trim()
	.split("\n")
	.map((line) => {
		const match = line.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*):\s*(.*)/);
		if (match) {
			return {
				startTime: parseFloat(match[1]),
				endTime: parseFloat(match[2]),
				text: match[3].trim(),
			};
		}
		return null;
	})
	.filter(Boolean);

// Get the total duration
const maxDuration = Math.max(...segments.map((seg) => seg.endTime));

// Create range slider container
const sliderContainer = document.createElement("div");
sliderContainer.style.margin = "20px";
document
	.getElementById("word-cloud")
	.parentNode.insertBefore(
		sliderContainer,
		document.getElementById("word-cloud")
	);

// Time formatting helper
function formatTime(seconds) {
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function draw(words) {
	d3.select("#word-cloud").selectAll("*").remove();

	const svg = d3
		.select("#word-cloud")
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	const container = svg
		.append("g")
		.attr("transform", `translate(${width / 2},${height / 2})`);

	container
		.selectAll("text")
		.data(words)
		.enter()
		.append("text")
		.style("font-size", (d) => `${d.size}px`)
		.style("font-family", "Arial")
		.style("fill", () => d3.schemeCategory10[Math.floor(Math.random() * 10)])
		.attr("text-anchor", "middle")
		.attr("transform", (d) => `translate(${d.x},${d.y})rotate(${d.rotate})`)
		.text((d) => d.text);
}

// Update word cloud based on time range
function updateWordCloud(startTime, endTime) {
	const filteredText = segments
		.filter((seg) => seg.startTime >= startTime && seg.endTime <= endTime)
		.map((seg) => seg.text)
		.join(" ");

	const words = filteredText
		.toLowerCase()
		.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
		.split(/\s+/)
		.filter((word) => word.length > 3)
		.reduce((acc, word) => {
			acc[word] = (acc[word] || 0) + 1;
			return acc;
		}, {});

	const wordData = Object.entries(words)
		.map(([text, size]) => ({ text, size: size * 10 }))
		.sort((a, b) => b.size - a.size)
		.slice(0, 100);

	const layout = d3.layout
		.cloud()
		.size([width, height])
		.words(wordData)
		.padding(5)
		.rotate(() => ~~(Math.random() * 2) * 90)
		.fontSize((d) => d.size)
		.on("end", draw);

	layout.start();
}

// Initialize noUiSlider
const rangeSlider = document.getElementById("range-slider");
noUiSlider.create(rangeSlider, {
	start: [0, maxDuration],
	connect: true,
	step: 0.1,
	range: {
		min: 0,
		max: maxDuration,
	},
});

// Add event listener for the range slider
rangeSlider.noUiSlider.on("update", function (values) {
	const [start, end] = values.map(parseFloat);
	document.getElementById("timeRange").textContent = `${formatTime(
		start
	)} - ${formatTime(end)}`;
	updateWordCloud(start, end);

	// Update active topic button based on time range
	const activeTopicIndex = topics.findIndex(
		(topic) =>
			Math.abs(topic.start - start) < 0.1 && Math.abs(topic.end - end) < 0.1
	);

	document.querySelectorAll(".topic-button").forEach((btn, index) => {
		btn.classList.toggle("active", index === activeTopicIndex);
	});
});

// Initial word cloud
updateWordCloud(0, maxDuration);
