---
title: How I Write RFCs
pubDate: 2025-05-23T00:00:00.000Z
author: Emin Tham
postType: standard
draft: false
description: A guide on how I write RFCs using AI assistants.
tags:
  - guide
  - assistant
  - technical
  - productivity
  - writing
  - rfc
  - software engineering
  - documentation
series: Software Engineering
---

I am sharing my approach to writing RFCs to invite discussion and feedback as I continue refining the method.

Note that if you are working on a small project or a simple problem, this process is overkill. Reserve this for
mission-critical projects or problems that require a more thorough examination.

## Process

### Investigations/Explorations

Start by writing down the available context, the surrounding systems, assumptions, and business requirements of the problem. Consider the problem independently until you've come up with some candidate solutions. At this point, you can loop in an AI to help. I work with a prompt that looks roughly like the following:

```
Let's brainstorm some ideas for [problem].

# Context

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

I have also considered the following alternatives
[document an alternative with similar details]

I have chosen not to pursue the alternative because [some reason].

Please come up with potential issues for my design considering the given context.
Consider the potential failure modes and how it affects the design.

Please also suggest improvements on the the design and come up with your own ideas for alternative designs.
```

### Iteration

The assistant will likely begin offering potential issues
as well as suggestions for improvements. Consider these critically and when
there are non-viable suggestions, push back, providing the missing
context on why that may not be a good idea. A useful tip here is to ask the
AI to consider either a narrower or more general problem [^shannon-creative].
Other meta-cognitive strategies, such as Munger's [inversion technique](https://fs.blog/inversion/)
for problem solving will likely work well here as well [^cfa] depending on the
actual problem you are solving. Throughout this process, your aim is to clarify enough of the
surrounding context and refine the design(s) proposed.

### First Draft

Once you have decided on an approach, write a draft without the assistant. Restarting fresh from scratch helps you think through the
entire problem from start to finish. Sometimes, you may uncover
gaps in your understanding or flaws with your design that require you to go back to the previous step.

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
a long way to making your RFC easier for them to understand and comment on as well as help upskill other engineers. Finally,
don't use acronyms without defining them. Nothing is more frustrating than
joining a company and trying to gather context on a project only to find that
all the documents are littered with inscrutable acronyms without a glossary.

#### Alternatives

This is where all your discussions with your assistant will prove valuable. You
should document the _key_ alternatives you considered and why you chose not to
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

#### Visuals

Visuals are a great way to communicate ideas. Use architecture diagrams, flowcharts, sequence
diagrams, API mockups, UI mockups, etc. to help the reader understand your ideas.

#### Simplification

If the solution/algorithm is complex with many edge cases, it may sometimes
be beneficial to simplify it, eliding some of the nuances, and only present a core
idea that is easily digestible. Slowly add back the nuances and edge cases
that you have glossed over in a section below. By doing so, you build the complex
from the simple and show how each piece of complexity is justified. Sometimes,
it requires breaking the solution into multiple pieces and presenting them
separately the same way you would modularize your code. Take note, however, of
_over-simplification_, you want to skip nit picky details but not crucial details
that masks fundamental flaws.

### Polishing

After I am done with a draft, I will usually just put it aside for some time and come back to it fresh, looking for any errors and omissions I may have made as well as making sure it flows well. It would also be a good idea at this time to start cutting sentences/ideas, delegating less important information to the appendix to focus the narrative.

Once I am reasonably happy with the draft, I will export it as markdown and pass
it to an assistant again for more polishing. Start a new
conversation so that the assistant is not tainted by the previous context--
some assistants have a tendency to become fixated and double down on their
opinions. An example prompt:

```
Please review this RFC and provide feedback on clarity and flow. Identify logical
gaps, alternative designs, and any potential simplifications to the design.
Please identify any unmentioned risks and failure modes not considered
in the document and suggest mitigation strategies. Finally, please highlight the assumptions, both explicit and implicit, within the RFC and assess
their validity. Identify key assumptions that will make or break the
proposed design or the project as a whole.
```

Take note of the assumptions and risks and write it down somewhere,
I have found out the hard way that even minor divergences
and "patches" to the design as assumptions change can lead to catastrophic
failure modes or unmaintainable designs if the team is not careful.

### Retrospective

In parallel with the RFC being reviewed, I will also record the blind spots or issues that I missed during the entire process to improve myself and the process.

[^shannon-creative]:
    This is a great way in general to solve problems and I
    learnt it from Claude Shannon's speech on [Creative Thinking](https://jamesclear.com/great-speeches/creative-thinking-by-claude-shannon).
    I highly recommend reading it if you are interested in the topic and additionally
    also recommend this [biography](https://www.goodreads.com/book/show/32919530-a-mind-at-play) of Shannon.

[^cfa]: Let me know in the comments below if you have suggestions for these!
