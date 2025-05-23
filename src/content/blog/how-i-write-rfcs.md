---
title: "How I Write RFCs"
pubDate: 2025-05-22
description: "A guide on how I write RFCs using AI assistants."
tags: ["guide", "assistant", "technical", "productivity", "writing"]
series: "Software Engineering"
draft: true
postType: "standard"

---

[Request For Comments](https://en.m.wikipedia.org/wiki/Request_for_Comments) (RFC)
are a great way to document and discuss ideas in software development [^rfc-sidenote].
We will not discuss the RFC process itself or the benefits it confers here and
just assume that you are familiar with it.

I have a process for [thinking](/blog/notes-on-writing-to-learn) about
software designs and writing technical documents using AI assistants that I have
been using for a while now [^non-tech-writing]. It works well for me and helps
me think through ideas in a more robust way. I am sharing this process to invite
discussion and feedback as I am always looking for ways to improve myself.

## The Process

### Think about the problem independently

Start by thinking about the problem without any input from AI. Humans are
driving the process and you should not bias your solution with early input
from AI.

### Brainstorming with AI

Once I have a good understanding of the problem and one or more candidate
designs/solutions, I will start bouncing ideas with AI. I work with a prompt
that looks roughly like the following:

```
Let's brainstorm some ideas for a [problem].

The context for this is:
- context about your problem, what you're trying to solve, etc.
- context about your organization, what metrics you care about, any special considerations.

The goals for the solution should be:
[goals]

The non-goals of the solution are:
[non-goals]

The constraints are:
[constraints]

The relevant pieces of existing services are:
- service1: context about why the service exists, its nuances, its behaviour, limitations, API provided, etc.
- ...
- serviceN: ...

# if this is an existing service that you are trying to improve
Currently the service does ... and we are trying to improve it by ...

# if this is a new service
We will be creating a brand new service that will integrate with some or all of
the above services.

My rough idea is as follows:
[describe your idea in detail, including the API, the data model, etc.]

I have also considered the following alternative
[document an alternative with similar details]

I have chosen not to pursue the alternative because [some reason].

Please come up with potential issues for my design considering the given context.
Consider the potential failure modes and how it affects the design.

Please also suggest improvements on the the design and come up with your own
ideas for alternative designs.
```


As you can probably tell, there is a lot of work required to fill in all these.
In particular, the context about the problem, the goals, the non-goals, and the
constraints will force you to think long and hard about your problem and is
also available when you need to actually write your RFC.

The surrounding services are also important. The better you can describe
the existing services and their characteristics, the better information the
assistant will have to work with. The good news is you can reuse this across
different prompts and share it amongst your team or reuse it for documentation
purposes if you are willing to keep it updated. I have not yet experimented
with trying to generate this context using AI but I suspect it might err on
providing too much information-- which could be useful if your assistant is
able to work with long contexts [^rag].

### Iterate on the design

At this point, the assistant should start coming up with potential issues
and suggestions for improvements. I will consider these critically and when
there are non-viable suggestions, I will push back and provide the missing
context on why it is not a good idea. A useful tip here is to ask the
assistant to consider a narrower or more general problem [^shannon-creative].
Other meta-cognitive strategies for problem solving will likely work well here
as well [^cfa].


[^rfc-sidenote]: If your company does not yet have such a document or process,
 consider introducing it. It can be a great way to get feedback on ideas
 and surface potential problems before someone comes out from their coding
 cave with an unmaintainable PR that no one can understand.
[^non-tech-writing]: I have a slightly modified process for other non-technical
 writing that I will cover in a future post.
[^rag]: Another avenue for experimentation would be to dump all these context
 into a vector database and use RAG on it. Perhaps someone can experiment and
 let me know how it goes.
[^shannon-creative]: This is a great way in general to solve problems and I
 learnt it from Claude Shannon's speech on [Creative Thinking](https://jamesclear.com/great-speeches/creative-thinking-by-claude-shannon).
 I highly recommend reading it if you are interested in the topic and additionally
 also recommend this [biography](https://www.goodreads.com/book/show/32919530-a-mind-at-play) of Shannon.
[^cfa]: Let me know in the comments below if you have suggestions for these!
