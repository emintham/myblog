---
title: "How I Write RFCs"
pubDate: 2025-05-23
description: "A guide on how I write RFCs using AI assistants."
tags: ["guide", "assistant", "technical", "productivity", "writing", "rfc", "software engineering", "documentation"]
series: "Software Engineering"
postType: "standard"

---

[Request For Comments](https://en.m.wikipedia.org/wiki/Request_for_Comments) (RFC)
are a great way to document and discuss ideas in software development [^rfc-sidenote].
We will not discuss the RFC process itself or the benefits it confers here and
just assume that you are familiar with it.

I've developed a method for [thinking](/blog/notes-on-writing-to-learn) about
software designs and writing technical documents with the help of AI assistants
which I've been refining for a while now [^non-tech-writing]. It works well for me and helps
me evaluate ideas in a more robust way by challenging my assumptions and
helping with surfacing issues I missed. I am sharing this approach to invite
discussion and feedback as I am always looking for ways to improve myself.

## Important Notes Before We Begin

### AI Assistant

When I say "AI assistant" in this post, I am referring in particular
to thinking models that are similar to or more powerful than [Gemini 2.5 Pro](https://gemini.google.com).
You will may or may not get the same results with a less capable assistant. I have
not done experiments to see if the AI's achievement in coding benchmarks
translates to better design thinking. If anyone has done such experiments,
please let me know in the comments below.

### Overkill

If you are working on a small project or a simple problem, this process may
be too lengthy and complex. You will probably want to use this only for more
mission-critical projects or problems that require a more thorough examination.


## The Process

### Ponder the Problem Independently

Start by reflecting on the problem without any input from AI. Humans are
~~currently still~~ driving the design and you should not bias your own thinking
with early input from AI.

### Brainstorming with AI

Only once I have a good understanding of the problem, its context, and have come up
with one or more candidate designs/solutions, will I start bouncing ideas with AI.
I work with a prompt that looks roughly like the following:

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


As you can probably tell, there is _a lot_ of work required to fill in all these.
In particular, the context about the problem, the goals, the non-goals, and the
constraints will force you to examine your problem deeply and explain your company's
overall software architecture (in particular the ones that are close to your
project) in a first principles fashion [^prj-ctx]. Furthermore, this explanation is also
available during your actual RFC drafting process and can be valuable by itself
as documentation.

The more comprehensively you describe the existing services and their characteristics,
the richer the information your AI partner will have to work with. Bear in mind
that you can reuse this context document across different prompts and share it
amongst your team so while it could be a lot of work to write initially, it
can yield compounding benefits [^maintain]. While I have not
tried generating this context with AI, it could be an interesting avenue to
explore. Though, I suspect it may over-specify the context with too much detail [^long-ctx] [^rag].

### Iterate on the Design(s)

At this point, the assistant will likely begin offering potential issues
as well as suggestions for improvements. Consider these critically and when
there are non-viable suggestions, push back, providing the missing
context on why that may not be a good idea. A useful tip here is to ask the
AI to consider a narrower or more general problem [^shannon-creative].
Other meta-cognitive strategies, such as Munger's [inversion technique](https://fs.blog/inversion/)
for problem solving will likely work well here as well [^cfa] depending on the
actual problem you are solving. Throughout this process, your aim is to clarify enough of the
surrounding context and refine the design(s) proposed. Discuss and debate as
you would a colleague.

Eventually, you will have one or more viable designs that you believe are good
solutions to your problem. You could ask the assistant to summarize the
context and designs at this point as material for writing your RFC but the
context should be fairly well defined and clear at this point that it may be
unnecessary.

### Writing a First Draft

Start writing a draft without the assistant. It helps you think through the
entire problem and solution from start to finish. Sometimes, you may uncover
gaps in your understanding or flaws with your design that require you to go back
to the previous step.

Everyone has a different [process](/blog/notes-on-writing-to-learn) of writing
but there are a few tips I can share.

#### Know Your Audience

Who is reading this RFC? Is this a committee of very senior engineers? Is the
context of the problem well-known to everyone involved? If so, perhaps you
won't need to cover the context in as much detail. I tend to err on the side of
providing all the relevant context and some history so that even someone new to
the team or company can read the RFC as a mostly self-contained document. I will
not spend too much time explaining existing services but I will provide links
to their design documents/RFCs for the uninitiated. Be empathetic to your readers,
certain design patterns or technologies, common knowledge to you, may be
new to others. Not everyone has the same background and
a quick link to external resources so that they can find out more will go
a long way to making your RFC easier for them to understand and comment on. Finally,
don't use acronyms without defining them. Nothing is more frustrating than
joining a company and trying to gather context on a project only to find that
all the documents are littered with inscrutable acronyms without a glossary.

#### Detail Alternatives

This is where all your discussions with your assistant will prove valuable. You
should document the *key* alternatives you considered and why you chose not to
pursue them. This is especially important if there are certain established
options (either in your company or in the industry) that you are not pursuing.
This is also important if you're applying for a patent or government grants--
you need to establish novelty and non-obviousness. Document the trade-offs, risks,
costs, and benefits of each alternative. Ideally, you should organize the
alternatives in some sort of hierarchy. For example, if you have three completely
orthogonal designs and minor variations within them, aim to present each independent
one in a section with their own sub-sections containing the variations. This
aids in understanding and provides handy references (e.g. Option A.1, A.2, B.1, etc.)
throughout the RFC. If it helps, summarize the options in a table with the pros and cons of each.

#### Use Visuals

Visuals are a great way to communicate ideas. Use architecture diagrams, flowcharts, sequence
diagrams, API mockups, UI mockups, etc. to help the reader understand your ideas.

#### Strategic Simplification

If the solution/algorithm is complex with many edge cases, it may sometimes
be beneficial to simplify it, eliding some of the nuances, and only present a core
idea that is easily digestible. Slowly add back the nuances and edge cases
that you have glossed over in a section below. By doing so, you build the complex
from the simple and show how each piece of complexity is justified. Sometimes,
it requires breaking the solution into multiple pieces and presenting them
separately the same way you would modularize your code. Take note, however, of
*over-simplification*, you want to skip nit picky details but not crucial details
that masks fundamental flaws.

### Polishing

After I am done with a draft, I will usually just put it aside for some time
and take a walk to clear my head. I will then come back to it and read it from
start to end a couple times, making sure it flows well and is easy to read.

Once I am reasonably happy with the draft, I will export it as markdown and pass
it to an assistant again for more polishing. It is key that you start a new
conversation so that the assistant is not tainted by the previous context--
some assistants have a tendency to become fixated and double down on their
opinions. I will use something akin to the following:

```
Please review this RFC and provide feedback on clarity and flow. Identify logical
gaps, alternative designs, and any potential simplifications to the design.
Please also note down any unmentioned risks and failure modes not considered
in the document as well as mitigation strategies. Finally, please provide
a list of assumptions, both explicit and implicit within the RFC and assess
their validity. Identify key assumptions that will make or break the
proposed design or the project as a whole.
```

Not all the output at this stage is valid. The assistant will sometimes
make invalid assumptions about the context you are working under or simply
hallucinate certain situations that are improbable. Use your best judgement.
If everything goes well, this will not identify any major issues and will
help you figure out if there are key risks that you have not considered or
crucial assumptions that your project rests upon. This is especially important
for the ongoing health of the project-- if key assumptions are violated during
the implementation, it may lead to a design that does not meet its stated goals.

If you have not yet done so, write down the list of assumptions and risks into
your document and how you plan to monitor or mitigate their risks. This should
be an ongoing process and the team should reconvene to discuss whether the
design still makes sense if the assumptions are violated. Minor divergences
and "patches" to the design as assumptions keep changing can lead to catastrophic
failure modes or unmaintainable designs if the team is not careful.

### Final Review

Sleep on the document for a few days, give it a final read and then start
circulating it for review. Start small with a few colleagues who understand
the problem well and slowly expand the audience to include more people.

#### Retrospective

In parallel with the RFC being reviewed, I will also take note and try to
internalize the blind spots or issues that I missed during the entire process.
I am seeking to

1. Improve myself technically and round out any technical gaps I have that the
    assistant was able to identify.
2. Improve the writing process and how I use the assistant to help me.

The assistant should be a tool to propel you forward and improve yourself, not
a crutch to lean on forever. It has the context and knowledge of the world
but is not creative enough to come up with completely novel ideas *yet*.

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
[^maintain]: So long as you take care to update it as things change.
[^long-ctx]: If your assistant works with long contexts, this may not be that
  much of a problem.
[^prj-ctx]: In particular, if your company has a habit of over-engineering
  or creating in-house versions of software, explaining the context and problems
  that those solutions were trying to address in the first place can be a useful
  exercise in reflecting on whether those assumptions are still valid and should
  be revisited.
