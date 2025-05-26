---
title: "Should You Learn to Code (as a Product Manager)?"
pubDate: 2024-08-26
description: "My thoughts on learning to code if you are a product manager"
tags: ["opinion", "technical", "guide", "product management", "software engineering", "learning", "career development"]
series: "Software Engineering"
postType: "standard"

---

(This is a re-post and revision of a post I wrote in 2024. I have since added
a few more thoughts and updated some of the side-notes.)

One of my dearest friends, a Product Manager at a software company, recently
asked for my advice on acquiring code skills. Our conversation was insightful, and
I’ve summarized the key points in this article.

# Why

Before you start learning how to code, it is crucial to clarify
*why* you might want to do so [^also].
If you are aiming to plan or estimate better by understanding your developer’s
trade-offs and decisions, then I do not believe learning to code is the most efficient path.
Introductory programming courses or coding bootcamps typically focus on syntax and basic
programming constructs to *make things happen* with code, which is far divorced from the
design decisions and discussions your developers are having (if this matches
your goals, I suggest skipping ahead to the next section for my advice).

If, however, your goal is to create scripts and dashboards to
extract insights from existing data, to validate new ideas, or to present metrics to
management, coding could be valuable. For the case of
queries/dashboards, I believe you should learn SQL directly using
any data/analytics platform your company has available. If you are looking
to create a quick proof of concept or script without taking up your developers'
time, learning Python would be really helpful. There are numerous free courses
that cover these effectively. In addition, I would highly recommend that you motivate your learning by a
particular problem/idea. Grasp the *barest* basics and then proceed to
try to solve your problem, and possibly failing, then figuring out why it didn’t work.
Unblock yourself by learning just the required skills and iterate. Learning SQL
and programming without any projects can be rather abstract for most people without
some motivating problem or a coach.

# What Else

If you're looking to deepen your understanding, I have two options for
you. The first is to just ask your
developers about what they’re talking about and have them explain in layman's
terms so that you can better understand the concepts and trade-offs. This is
probably the fastest way you can gain context and useful information directly relevant
to your domain and your tasks. This requires fostering an open, trusting relationship
with your development team. Show genuine curiosity, and perhaps schedule brief,
dedicated times for these discussions.

If the above feels unsatisfactory and you wish to go deeper, another option is
a book like [Tech Simplified for PMs and Entrepreneurs](https://www.amazon.ca/Tech-Simplified-Entrepreneurs-Deepak-Singh/dp/9355664990)
that covers the broad basics. Another good option is to go through [System Design
Interview](https://www.amazon.ca/System-Design-Interview-insiders-Second/dp/B08CMF2CQF/ref=asc_df_B08CMF2CQF?mcid=3ef49e4e65613020abf3398d3598d155&tag=googleshopc0c-20&linkCode=df0&hvadid=706840526768&hvpos=&hvnetw=g&hvrand=3661384844743060318&hvpone=&hvptwo=&hvqmt=&hvdev=t&hvdvcmdl=&hvlocint=&hvlocphy=9001491&hvtargid=pla-934212337151&psc=1&gad_source=1).
This book in particular builds up a modern distributed
system from a simple starting point and proceeds to scale different parts of
the architecture, thereby providing you
the perspective and motivation for many of the changes your developer team may be
proposing. If you wish to go deeper still, [Designing Data-Intensive Applications](https://dataintensive.net/) [^new-book]
is the last resource I'll highlight. Note that this last book goes
very deep in certain sections but has the benefit of also being very wide. I
suggest just skimming each section as it’s very easy to get lost in the extraneous
details that won't matter too much to you if this is not within your [circle of
competence](https://fs.blog/circle-of-competence/). Use it as a map or reference
to dive deeper if one of the topics comes up at work.

# 2025 Update

Looking back at this post, it is interesting to note that the use of an AI
assistant for this problem did not occur to me at that time. AI has come
[a long way](/blog/how-i-write-rfcs) since then and I now believe that in the latter case, you can
go a long way by having an AI assistant explain the common concepts and components
to you without necessarily having to go through all those books I mentioned above.
This would be a far more efficient path, much like the just-in-time learning
method I mentioned for actually learning how to code. For generating code, however,
caution needs to be exercised as AI can be prone to hallucinations or creating
subtle bugs that are hard to catch.

[^also]: While this is written for Product Managers, this line of thinking is generally
  applicable to anyone who is thinking of learning to code without necessarily
  becoming a programmer. The advice that follows however is more specific to
  Product Managers.
[^new-book]: Rumour has it that a second edition may be coming out in 2025, so you
  may want to wait for that.
